import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProtocolDocumentMetaEntity } from './document-meta.entity';

@Injectable({ scope: Scope.REQUEST })
export class ProtocolDocumentMetaRepository {
  constructor(
    @Inject(`${ProtocolDocumentMetaEntity.name}Repository`)
    private readonly repo: Repository<ProtocolDocumentMetaEntity>,
  ) {}

  async create(data: Partial<ProtocolDocumentMetaEntity>): Promise<ProtocolDocumentMetaEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async findCurrentByProtocolId(protocolId: string): Promise<ProtocolDocumentMetaEntity | null> {
    return this.repo.findOne({ where: { protocolId, isCurrent: true } });
  }

  async findAllByProtocolId(protocolId: string): Promise<ProtocolDocumentMetaEntity[]> {
    return this.repo.find({
      where: { protocolId },
      order: { version: 'DESC' }, // 👈 latest first
    });
  }

  async getLatestVersion(protocolId: string): Promise<number> {
    const latest = await this.repo.findOne({
      where: { protocolId },
      order: { version: 'DESC' },
    });
    return latest?.version ?? 0;
  }

  async markAsReplaced(id: string, replacedById: string): Promise<void> {
    await this.repo.update(id, {
      isCurrent: false,
      replacedAt: new Date(),
      replacedById,
    });
  }

  async update(id: string, data: Partial<ProtocolDocumentMetaEntity>): Promise<void> {
    await this.repo.update(id, data);
  }
}