import { Inject, Injectable, Scope } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { FacebookFormEntity } from '../entities/facebook-form.entity';

@Injectable({ scope: Scope.REQUEST })
export class FacebookFormRepository {
  constructor(
    @Inject(`${FacebookFormEntity.name}Repository`)
    private readonly repo: Repository<FacebookFormEntity>,
  ) {}

  create(dto: Partial<FacebookFormEntity>): FacebookFormEntity {
    return this.repo.create(dto);
  }

  async save(entity: FacebookFormEntity): Promise<FacebookFormEntity> {
    return this.repo.save(entity);
  }

  async remove(entity: FacebookFormEntity): Promise<FacebookFormEntity> {
    return this.repo.remove(entity);
  }

  async findById(id: string): Promise<FacebookFormEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByFormId(formId: string): Promise<FacebookFormEntity | null> {
    return this.repo.findOne({ where: { formId } });
  }

  async findByFormIds(formIds: string[]): Promise<FacebookFormEntity[]> {
    if (!formIds.length) return [];
    return this.repo.find({ where: { formId: In(formIds) } });
  }

  async findByPageId(pageId: string): Promise<FacebookFormEntity[]> {
    return this.repo.find({ where: { pageId } });
  }

  async findAll(): Promise<FacebookFormEntity[]> {
    return this.repo.find();
  }
}