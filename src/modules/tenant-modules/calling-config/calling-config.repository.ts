import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CallingConfigEntity } from './calling-config.entity';

@Injectable({ scope: Scope.REQUEST })
export class CallingConfigRepository {
  constructor(
    @Inject(`${CallingConfigEntity.name}Repository`)
    private readonly repo: Repository<CallingConfigEntity>,
  ) {}

  create(dto: Partial<CallingConfigEntity>): CallingConfigEntity {
    return this.repo.create(dto);
  }

  async save(entity: CallingConfigEntity): Promise<CallingConfigEntity> {
    return this.repo.save(entity);
  }

  async remove(entity: CallingConfigEntity): Promise<CallingConfigEntity> {
    return this.repo.remove(entity);
  }

  async findById(id: string): Promise<CallingConfigEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<CallingConfigEntity[]> {
    return this.repo.find();
  }

  async findByProtocol(protocolId: string): Promise<CallingConfigEntity[]> {
    return this.repo.find({ where: { protocolId } });
  }

  async findDefaultByProtocol(protocolId: string): Promise<CallingConfigEntity | null> {
    return this.repo.findOne({ where: { protocolId, isDefault: true } });
  }

  async clearDefaultForProtocol(protocolId: string): Promise<void> {
    await this.repo.update({ protocolId, isDefault: true }, { isDefault: false });
  }
}