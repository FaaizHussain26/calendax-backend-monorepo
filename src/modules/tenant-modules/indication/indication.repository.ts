import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { IndicationEntity } from './indication.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { SiteEntity } from '../site/site.entity';

@Injectable({ scope: Scope.REQUEST })
export class IndicationRepository {
  constructor(
    @Inject(`${IndicationEntity.name}Repository`)
    private readonly repo: Repository<IndicationEntity>,
  ) {}

  async findAll(query: PaginationDto) {
    const { search, page = 1, limit = 10, all = false } = query;

    const [data, total] = await this.repo.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { createdAt: 'DESC' },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return { data, total, page, limit };
  }
  async findById(id: string) {
    return await this.repo.findOne({ where: { id: id } });
  }
  async create(dto: Partial<IndicationEntity>): Promise<IndicationEntity> {
    return this.repo.save(this.repo.create(dto));
  }
  async findOneByCondition(condition: FindOptionsWhere<IndicationEntity>): Promise<IndicationEntity | null> {
    return this.repo.findOne({ where: condition });
  }
  async update(id: string, data: Partial<IndicationEntity>): Promise<IndicationEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
