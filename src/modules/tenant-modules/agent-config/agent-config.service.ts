import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentConfigDto, UpdateAgentConfigDto } from './agent-config.dto';
import { AgentConfigRepository } from './agent-config.repository';
import { AgentConfigEntity } from './agent-config.entity';
import { ElevenLabsService } from '../../../services/elevenlabs/elevenlabs.service';

@Injectable()
export class AgentConfigService {
  constructor(
    private readonly repo: AgentConfigRepository,
    private readonly elevenLabs: ElevenLabsService,
  ) {}

  async create(dto: CreateAgentConfigDto): Promise<AgentConfigEntity> {
    const agentId = await this.elevenLabs.createAgent({
      tone: dto.tone,
      gender: dto.gender,
      openingScript: dto.openingScript,
      endingScript: dto.endingScript,
    });

    const entity = this.repo.create({ ...dto, agentId });
    return this.repo.save(entity);
  }

  async findAll(): Promise<AgentConfigEntity[]> {
    return this.repo.findAllSorted();
  }

  async findCurrent(): Promise<AgentConfigEntity | null> {
    return this.repo.findCurrent();
  }

  async findOne(id: string): Promise<AgentConfigEntity> {
    const config = await this.repo.findById(id);
    if (!config) {
      throw new NotFoundException(`AgentConfig with id "${id}" not found.`);
    }
    return config;
  }

  async update(id: string, dto: UpdateAgentConfigDto): Promise<AgentConfigEntity> {
    const config = await this.findOne(id);
    Object.assign(config, dto);

    if (config.agentId) {
      await this.elevenLabs.updateAgent(config.agentId, {
        tone: config.tone,
        gender: config.gender,
        openingScript: config.openingScript,
        endingScript: config.endingScript,
      });
    } else {
      // No agentId means ElevenLabs creation failed previously — retry it now
      const agentId = await this.elevenLabs.createAgent({
        tone: config.tone,
        gender: config.gender,
        openingScript: config.openingScript,
        endingScript: config.endingScript,
      });
      config.agentId = agentId;
    }

    return this.repo.save(config);
  }

  async remove(id: string): Promise<{ message: string }> {
    const config = await this.findOne(id);

    if (config.agentId) {
      await this.elevenLabs.deleteAgent(config.agentId);
    }

    await this.repo.remove(config);
    return { message: `AgentConfig "${id}" deleted successfully.` };
  }
}