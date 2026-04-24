// business-config.repository.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BusinessConfigEntity } from './business-config.entity';

@Injectable({ scope: Scope.REQUEST })
export class BusinessConfigRepository {
  constructor(
    @Inject(`${BusinessConfigEntity.name}Repository`)
    private readonly repo: Repository<BusinessConfigEntity>,
  ) {}

  create(dto: Partial<BusinessConfigEntity>): BusinessConfigEntity {
    return this.repo.create(dto);
  }

  async save(entity: BusinessConfigEntity): Promise<BusinessConfigEntity> {
    return this.repo.save(entity);
  }

  async remove(entity: BusinessConfigEntity): Promise<BusinessConfigEntity> {
    return this.repo.remove(entity);
  }
  async findConfig(): Promise<BusinessConfigEntity | null> {
    return this.repo.findOne({ where: {} });
  }
}
