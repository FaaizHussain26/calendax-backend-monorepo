import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AgentGender, AgentTone } from '../../../common/enums/agent.enum';
import { AgentConfigEntity } from './agent-config.entity';

@Injectable({ scope: Scope.REQUEST })
export class AgentConfigRepository {
  constructor(
    @Inject(`${AgentConfigEntity.name}Repository`)
    private readonly repo: Repository<AgentConfigEntity>,
  ) {}

  create(dto: Partial<AgentConfigEntity>): AgentConfigEntity {
    return this.repo.create(dto);
  }

  async save(entity: AgentConfigEntity): Promise<AgentConfigEntity> {
    return this.repo.save(entity);
  }

  async remove(entity: AgentConfigEntity): Promise<AgentConfigEntity> {
    return this.repo.remove(entity);
  }

  async findAllSorted(): Promise<AgentConfigEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
  async findCurrent(): Promise<AgentConfigEntity|null> {
    return this.repo.findOne({ where: { isCurrent: true } });
  }

  async findById(id: string): Promise<AgentConfigEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByTone(tone: AgentTone): Promise<AgentConfigEntity[]> {
    return this.repo.find({ where: { tone }, order: { createdAt: 'DESC' } });
  }

  async findByGender(gender: AgentGender): Promise<AgentConfigEntity[]> {
    return this.repo.find({ where: { gender }, order: { createdAt: 'DESC' } });
  }
}