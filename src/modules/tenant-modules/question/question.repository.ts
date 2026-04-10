import { Inject, Injectable, Scope } from '@nestjs/common';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { QuestionEntity } from './question.entity';
import { QuestionStatus } from '../../../common/enums/question.enum';
import { ListQuestionsQueryDto } from './question.dto';

@Injectable({ scope: Scope.REQUEST })
export class QuestionRepository {
  constructor(
    @Inject(`${QuestionEntity.name}Repository`)
    private readonly repo: Repository<QuestionEntity>,
  ) {}

  async findAll(query: ListQuestionsQueryDto) {
    const { page = 1, limit = 10, all = false, search, protocolId, documentId, status, isApproved } = query;

    const where: FindOptionsWhere<QuestionEntity> = {
      ...(protocolId && { protocolId }),
      ...(documentId && { documentId }),
      ...(status && { status }),
      ...(isApproved !== undefined && { isApproved }),
      ...(search && { question: ILike(`%${search}%`) }),
    };

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: { protocol: true, document: true },
      order: { createdAt: 'DESC' },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<QuestionEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { protocol: true, document: true },
    });
  }

  async findByProtocolId(protocolId: string): Promise<QuestionEntity[]> {
    return this.repo.find({
      where: { protocolId },
      relations: { document: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByDocumentId(documentId: string): Promise<QuestionEntity[]> {
    return this.repo.find({ where: { documentId } });
  }

  async create(data: Partial<QuestionEntity>): Promise<QuestionEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async createMany(data: Partial<QuestionEntity>[]): Promise<QuestionEntity[]> {
    return this.repo.save(data.map((d) => this.repo.create(d)));
  }

  async update(id: string, data: Partial<QuestionEntity>): Promise<QuestionEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async approve(id: string): Promise<QuestionEntity | null> {
    return this.update(id, { isApproved: true, status: QuestionStatus.APPROVED });
  }

  async reject(id: string): Promise<QuestionEntity | null> {
    return this.update(id, { isApproved: false, status: QuestionStatus.REJECTED });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async findOneByCondition(condition: FindOptionsWhere<QuestionEntity>): Promise<QuestionEntity | null> {
    return this.repo.findOne({ where: condition });
  }
}