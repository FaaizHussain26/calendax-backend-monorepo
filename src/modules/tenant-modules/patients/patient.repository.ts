import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PatientEntity } from './patient.entity';

@Injectable({ scope: Scope.REQUEST })
export class PatientRepository {
  constructor(
    @Inject(`${PatientEntity.name}Repository`)
    private readonly repo: Repository<PatientEntity>,
  ) {}

  create(dto: Partial<PatientEntity>): PatientEntity {
    return this.repo.create(dto);
  }

  async save(entity: PatientEntity): Promise<PatientEntity> {
    return this.repo.save(entity);
  }

  async remove(entity: PatientEntity): Promise<PatientEntity> {
    return this.repo.remove(entity);
  }

  async findById(id: string): Promise<PatientEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['site', 'lead'],
    });
  }

  async findByLeadId(leadId: string): Promise<PatientEntity | null> {
    return this.repo.findOne({
      where: { leadId },
      relations: ['site', 'lead'],
    });
  }

  async findBySite(siteId: string): Promise<PatientEntity[]> {
    return this.repo.find({
      where: { siteId },
      relations: ['site', 'lead'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<PatientEntity[]> {
    return this.repo.find({
      relations: ['site', 'lead'],
      order: { createdAt: 'DESC' },
    });
  }
}
