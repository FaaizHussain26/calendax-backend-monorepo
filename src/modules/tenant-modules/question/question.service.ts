import { BadRequestException, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { QuestionRepository } from './question.repository';
import { CreateQuestionDto, CreateBulkQuestionsDto, UpdateQuestionDto, ListQuestionsQueryDto } from './question.dto';
import { QuestionEntity } from './question.entity';
import { ProtocolService } from '../protocol/protocol.service';
import { ProtocolDocumentMetaRepository } from '../protocol/document/document-meta.repository';
import { QuestionStatus } from '../../../common/enums/question.enum';
import { Db } from 'mongodb';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import {
  IProtocolDocument,
  PROTOCOL_DOCUMENT_COLLECTION,
} from '../../../common/interfaces/collections/protocol-document.interface';

@Injectable({ scope: Scope.REQUEST })
export class QuestionService {
  private readonly openai: OpenAI;

  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly protocolService: ProtocolService,
    private readonly configService: ConfigService,
    private readonly protocolDocumentMetaRepository: ProtocolDocumentMetaRepository,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.key'),
    });
  }

  async findAll(query: ListQuestionsQueryDto) {
    return this.questionRepository.findAll(query);
  }

  async findById(id: string): Promise<QuestionEntity> {
    const question = await this.questionRepository.findById(id);
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async findByProtocolId(protocolId: string): Promise<QuestionEntity[]> {
    await this.protocolService.findById(protocolId); // validate protocol exists
    return this.questionRepository.findByProtocolId(protocolId);
  }

  async create(dto: CreateQuestionDto): Promise<QuestionEntity> {
    await this.validateProtocolAndDocument(dto.protocolId, dto.documentId);
    return this.questionRepository.create(dto);
  }

  async generateQuestions(
    protocolId: string,
    mongo: Db,
    indication?: string,
    additionalContext?: string,
  ): Promise<{ question: string; summary: string; entity: QuestionEntity | null }> {
    return this.generate(protocolId, mongo, indication, additionalContext);
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<QuestionEntity> {
    await this.findById(id); // throws if not found
    await this.questionRepository.update(id, dto);
    return this.findById(id);
  }

  async approve(id: string): Promise<QuestionEntity> {
    await this.questionRepository.approve(id); // repo handles update
    const updated = await this.questionRepository.findById(id);
    if (!updated) throw new NotFoundException('Question not found');
    return updated;
  }

  async reject(id: string): Promise<QuestionEntity> {
    await this.questionRepository.reject(id);
    const updated = await this.questionRepository.findById(id);
    if (!updated) throw new NotFoundException('Question not found');
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.questionRepository.delete(id);
    return { message: 'Question deleted successfully' };
  }
  async generate(
    protocolId: string,
    mongo: Db,
    indication?: string,
    additionalContext?: string, 
  ): Promise<{ question: string; summary: string; entity: QuestionEntity }> {
    const currentDoc = await this.protocolDocumentMetaRepository.findCurrentByProtocolId(protocolId);
    if (!currentDoc?.id) {
      throw new NotFoundException('A current active doc not found for protocol');
    }
    if (!currentDoc?.isProcessed)
      throw new Error('Document is being processed cannot generate questions now. Try agian after sometime');
    // 1. check if approved question exists — cannot regenerate
    const existing = await this.questionRepository.findOneByCondition({
      protocolId,
      documentId:currentDoc.id,
      status: QuestionStatus.APPROVED,
    });
    if (existing) {
      throw new BadRequestException('Cannot regenerate an approved questionnaire');
    }

    // 2. get embedding for search query
    const queryEmbedding = await this.getEmbedding('inclusion criteria exclusion criteria');

    // 3. vector search in MongoDB
    const contextChunks = await this.vectorSearch(mongo, queryEmbedding, protocolId);
    if (!contextChunks.length) {
      throw new NotFoundException('No relevant information found for this protocol — ensure document is processed');
    }

    // 4. build context and generate with GPT
    const context = contextChunks.map((c) => c.text).join('\n\n');
    const prompt = this.buildPrompt(context, indication, additionalContext);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert medical questionnaire builder. Follow all instructions precisely.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content ?? '';

    // 5. extract questionnaire and summary from response
    const { question, summary } = this.parseResponse(response);

    if (!question) {
      throw new BadRequestException('Failed to generate questionnaire from AI response');
    }

    // 6. upsert — update existing pending or create new
    const pendingQuestion = await this.questionRepository.findOneByCondition({
      protocolId,
      documentId:currentDoc.id,
      status: QuestionStatus.PENDING,
    });

    let entity: QuestionEntity | null;

    if (pendingQuestion) {
      // update existing pending
      await this.questionRepository.update(pendingQuestion.id, {
        question,
        summary,
        indication,
      });
      entity = await this.questionRepository.findById(pendingQuestion.id);
    } else {
      // create new
      entity = await this.questionRepository.create({
        protocolId,
        documentId:currentDoc.id,
        question,
        summary,
        indication,
        status: QuestionStatus.PENDING,
        isApproved: false,
      });
    }

    return { question, summary, entity: entity! };
  }

  private async vectorSearch(mongo: Db, queryEmbedding: number[], protocolId: string): Promise<IProtocolDocument[]> {

    let data=await mongo
      .collection(PROTOCOL_DOCUMENT_COLLECTION)
      .aggregate<IProtocolDocument>([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 10,
            filter: { protocol_id: protocolId },
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ]).toArray()
      console.log("embedding data:",data.length)
      return data
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const resp = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    console.log('res of get embedding:',resp.data[0].embedding.length)
    return resp.data[0].embedding;
  }

  private buildPrompt(context: string, indication?: string, additionalContext?: string): string {
    return `
You are building a medical questionnaire based on the following protocol context.

PROTOCOL CONTEXT:
${context}

${indication ? `INDICATION: ${indication}` : ''}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}

Generate a comprehensive questionnaire with questions about inclusion/exclusion criteria, 
patient eligibility, and protocol requirements.

Format your response EXACTLY as:
===QUESTIONNAIRE_START===
[Your questionnaire here]
===QUESTIONNAIRE_END===

===SUMMARY_START===
[Brief summary of key criteria]
===SUMMARY_END===
    `.trim();
  }

  private parseResponse(response: string): { question: string; summary: string } {
    const questionMatch = response.match(/===QUESTIONNAIRE_START===([\s\S]*?)===QUESTIONNAIRE_END===/);
    const summaryMatch = response.match(/===SUMMARY_START===([\s\S]*?)===SUMMARY_END===/);

    return {
      question: questionMatch ? questionMatch[1].trim() : '',
      summary: summaryMatch ? summaryMatch[1].trim() : '',
    };
  }
  private async validateProtocolAndDocument(protocolId: string, documentId: string): Promise<void> {
    await this.protocolService.findById(protocolId);

    const document = await this.protocolDocumentMetaRepository.findCurrentByProtocolId(protocolId);
    if (!document || document.id !== documentId) {
      throw new NotFoundException('Document not found for this protocol');
    }
  }
}
