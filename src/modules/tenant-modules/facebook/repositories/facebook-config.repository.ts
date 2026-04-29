import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FacebookConfigEntity } from '../entities/facebook-config.entity';

@Injectable({ scope: Scope.REQUEST })
export class FacebookConfigRepository {
  constructor(
    @Inject(`${FacebookConfigEntity.name}Repository`)
    private readonly repo: Repository<FacebookConfigEntity>,
  ) {}

  create(dto: Partial<FacebookConfigEntity>): FacebookConfigEntity {
    return this.repo.create(dto);
  }

  async save(entity: FacebookConfigEntity): Promise<FacebookConfigEntity> {
    return this.repo.save(entity);
  }

  async remove(entity: FacebookConfigEntity): Promise<FacebookConfigEntity> {
    return this.repo.remove(entity);
  }

  async findConfig(): Promise<FacebookConfigEntity | null> {
    return this.repo.findOne({ where: {} });
  }
}
