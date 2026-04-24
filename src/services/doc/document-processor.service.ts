// common/services/document-processor.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import { PDFParse } from 'pdf-parse';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { DocumentChunk, ProcessDocumentOptions, ProcessDocumentResult } from '@libs/common/interfaces/document.interface';
import { deleteFile } from '../upload/upload.helper';



@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.key'),
    });
  }

  async processDocument(
    file: Express.Multer.File,
    options: ProcessDocumentOptions,
  ): Promise<ProcessDocumentResult> {
    let processingSucceeded = false;

    try {
      // 1. extract text from PDF
      const chunks = await this.extractAndChunkPDF(file, options);

      // 2. generate embeddings for all chunks in parallel
      const chunksWithEmbeddings = await this.generateEmbeddings(chunks);

      processingSucceeded = true;
      return {
      chunks: chunksWithEmbeddings,
      totalPages: Math.max(...chunks.map((c) => c.page)),
      totalChunks: chunksWithEmbeddings.length,
    };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Document processing failed: ${err.message}`);
      throw new InternalServerErrorException(`Document processing failed: ${err.message}`);
    } finally {
      // 3. only delete temp file if processing succeeded
      if (processingSucceeded) {
        deleteFile(file.path);
      } else {
        this.logger.warn(`Processing failed — temp file kept for debugging: ${file.path}`);
      }
    }
  }

private async extractAndChunkPDF(
  file: Express.Multer.File,
  options: ProcessDocumentOptions,
): Promise<Omit<DocumentChunk, 'embedding'>[]> {
  const dataBuffer = fs.readFileSync(file.path);
  
  const parser = new PDFParse({ data: dataBuffer });
const text= (await parser.getText()).text
  if (!text?.trim()) {
    throw new Error('Failed to extract text from PDF — document may be empty, scanned, or image-based');
  }

  const pages = text.split(/\f/);
  this.logger.log(`Extracted ${pages.length} pages from ${file.originalname}`);

  const chunks: Omit<DocumentChunk, 'embedding'>[] = [];

  for (const [pageIdx, pageText] of pages.entries()) {
    const textChunks = this.splitTextIntoChunks(pageText.trim());

    for (const [chunkIdx, chunkText] of textChunks.entries()) {
      if (!chunkText) continue;
      chunks.push({
        text: chunkText,
        page: pageIdx + 1,
        chunk: chunkIdx + 1,
        protocolId: options.protocolId,
        siteIds: options.siteIds,
      });
    }
  }

  if (!chunks.length) {
    throw new Error('No text chunks generated from PDF');
  }

  this.logger.log(`Generated ${chunks.length} chunks from ${file.originalname}`);
  return chunks;
}

  private async generateEmbeddings(
    chunks: Omit<DocumentChunk, 'embedding'>[],
  ): Promise<DocumentChunk[]> {
    // process in batches of 20 to avoid overwhelming OpenAI API
    const BATCH_SIZE = 20;
    const results: DocumentChunk[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchWithEmbeddings = await Promise.all(
        batch.map(async (chunk) => ({
          ...chunk,
          embedding: await this.getEmbedding(chunk.text),
        })),
      );
      results.push(...batchWithEmbeddings);
      this.logger.log(`Processed embeddings batch ${Math.ceil((i + 1) / BATCH_SIZE)}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
    }

    return results;
  }

  private async getEmbedding(text: string): Promise<number[]> {
    if (!text?.trim()) throw new Error('Cannot generate embedding for empty text');

    const resp = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return resp.data[0].embedding;
  }

  private splitTextIntoChunks(text: string, maxLength = 2000): string[] {
    if (!text?.trim()) return [];

    const chunks: string[] = [];
    const words = text.split(' ');
    let current = '';

    for (const word of words) {
      if ((current + ' ' + word).trim().length <= maxLength) {
        current = (current + ' ' + word).trim();
      } else {
        if (current) chunks.push(current);
        current = word;
      }
    }

    if (current) chunks.push(current);
    return chunks;
  }
}