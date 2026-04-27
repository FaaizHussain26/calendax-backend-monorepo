import { Injectable, NotFoundException } from '@nestjs/common';
import { CallingConfigEntity } from './calling-config.entity';
import { CreateCallingConfigDto, UpdateCallingConfigDto } from './calling-config.dto';
import { CallingConfigRepository } from './calling-config.repository';
import { AwsSchedulerService } from '@libs/aws/aws-scheduler.service';

@Injectable()
export class CallingConfigService {
  constructor(
    private readonly repo: CallingConfigRepository,
    private readonly awsScheduler: AwsSchedulerService,
  ) {}

  async getAll(): Promise<CallingConfigEntity[]> {
    return this.repo.findAll();
  }

  async getByProtocol(protocolId: string): Promise<CallingConfigEntity[]> {
    return this.repo.findByProtocol(protocolId);
  }

  async getById(id: string): Promise<CallingConfigEntity> {
    const config = await this.repo.findById(id);
    if (!config) {
      throw new NotFoundException('Calling config not found.');
    }
    return config;
  }

async create(dto: CreateCallingConfigDto, tenantId: string): Promise<CallingConfigEntity> {
  if (dto.isDefault) {
    await this.repo.clearDefaultForProtocol(dto.protocolId);
  }

  const entity = this.repo.create(dto);
  const saved = await this.repo.save(entity);

  const ruleName = await this.awsScheduler.createSchedule(
    tenantId,
    saved.id,
    saved.selectedDays,
    saved.callTimeWindow.startTime,
  );

  // save rule name back to entity
  saved.scheduleRuleName = ruleName;
  await this.repo.save(saved);

  return saved;
}
  async update(id: string, dto: UpdateCallingConfigDto,tenantId:string): Promise<CallingConfigEntity> {
    const existing = await this.getById(id);

    if (dto.isDefault) {
      await this.repo.clearDefaultForProtocol(dto.protocolId ?? existing.protocolId);
    }

    Object.assign(existing, dto);
    const saved = await this.repo.save(existing);

    await this.awsScheduler.updateSchedule(
     tenantId,
      saved.id,
      saved.selectedDays,
      saved.callTimeWindow.startTime,
    );

    return saved;
  }

  async remove(id: string,tenantId:string): Promise<{ message: string }> {
    const config = await this.getById(id);
    await this.repo.remove(config);

    await this.awsScheduler.deleteSchedule(
      tenantId,
      id,
    );

    return { message: 'Calling config deleted successfully.' };
  }
}