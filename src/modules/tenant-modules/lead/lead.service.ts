import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LeadEntity, } from './lead.entity';
import {
  CreateLeadDto,
  UpdateLeadDto,
  UpdateLeadStatusDto,
  CreateLeadFromFacebookDto,
  BulkCreateLeadDto,
  LeadQueryDto,
} from './lead.dto';
import { LeadRepository } from './lead.repository';
import { LeadSource, LeadStatus } from '@libs/common/enums/lead.enum';

export interface BulkCreateResult {
  created: number;
  failed: number;
  errors: Array<{ index: number; reason: string }>;
}
export interface PaginatedLeads {
  data: LeadEntity[];
  total: number;
  page: number;
  limit: number;
}
@Injectable()
export class LeadService {
  constructor(private readonly repo: LeadRepository) {}

  async findAll(query: LeadQueryDto): Promise<PaginatedLeads> {
    return this.repo.findAllPaginated(query);
  }

  async findById(id: string): Promise<LeadEntity> {
    const lead = await this.repo.findById(id);
    if (!lead) throw new NotFoundException(`Lead "${id}" not found.`);
    return lead;
  }


  async create(dto: CreateLeadDto): Promise<LeadEntity> {
    const entity = this.repo.create({
      ...dto,
      source: LeadSource.MANUAL,
      status: LeadStatus.PENDING,
    });
    return this.repo.save(entity);
  }


  async bulkCreate(dto: BulkCreateLeadDto): Promise<BulkCreateResult> {
    const errors: Array<{ index: number; reason: string }> = [];
    const valid: LeadEntity[] = [];

    for (let i = 0; i < dto.leads.length; i++) {
      const row = dto.leads[i];
      try {
        if (!row.firstName || !row.lastName || !row.phone || !row.protocolId) {
          throw new Error('firstName, lastName, phone and protocolId are required.');
        }
        valid.push(
          this.repo.create({
            ...row,
            source: LeadSource.MANUAL,
            status: LeadStatus.PENDING,
          }),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push({ index: i, reason: message });
      }
    }

    if (valid.length > 0) {
      await this.repo.saveMany(valid);
    }

    return {
      created: valid.length,
      failed: errors.length,
      errors,
    };
  }

 
  async createFromFacebook(dto: CreateLeadFromFacebookDto): Promise<LeadEntity> {
    const entity = this.repo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      email: dto.email,
      source: LeadSource.FACEBOOK,
      status: LeadStatus.PENDING,
      protocolId: dto.protocolId,
      callingConfigId: dto.callingConfigId,
      facebookFormId: dto.facebookFormId,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateLeadDto): Promise<LeadEntity> {
    const lead = await this.findById(id);
    Object.assign(lead, dto);
    return this.repo.save(lead);
  }
  async addTranscript(id:string,{transcript:string}){
    return //add transcript save function here
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<LeadEntity> {
    const lead = await this.findById(id);

    const validTransitions: Record<LeadStatus, LeadStatus[]> = {
      [LeadStatus.PENDING]: [LeadStatus.CALLING, LeadStatus.REJECTED,LeadStatus.PAUSED],
      [LeadStatus.CALLING]: [LeadStatus.SCREENED, LeadStatus.PENDING, LeadStatus.REJECTED,LeadStatus.PAUSED],
      [LeadStatus.SCREENED]: [LeadStatus.CONVERTED, LeadStatus.REJECTED],
      [LeadStatus.CONVERTED]: [],
      [LeadStatus.REJECTED]: [],
      [LeadStatus.PAUSED]:[]
    };

    if (!validTransitions[lead.status].includes(dto.status)) {
      throw new BadRequestException(`Cannot transition lead from "${lead.status}" to "${dto.status}".`);
    }

    lead.status = dto.status;
    return this.repo.save(lead);
  }

  async remove(id: string): Promise<{ message: string }> {
    const lead = await this.findById(id);
    await this.repo.remove(lead);
    return { message: `Lead "${id}" deleted successfully.` };
  }


  async findPendingByCallingConfig(callingConfigId: string, limit: number): Promise<LeadEntity[]> {
    return this.repo.findPendingByCallingConfig(callingConfigId, limit);
  }

  async countPendingByCallingConfig(callingConfigId: string): Promise<number> {
    return this.repo.countPendingByCallingConfig(callingConfigId);
  }
}
