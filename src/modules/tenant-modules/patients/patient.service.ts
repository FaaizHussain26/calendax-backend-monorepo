import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PatientEntity } from './patient.entity';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PrefilledPatientDto,
} from './patient.dto';
import { PatientRepository } from './patient.repository';
import { LeadService } from '../lead/lead.service';
import { LeadStatus } from '@libs/common/enums/lead.enum';

@Injectable()
export class PatientService {
  constructor(
    private readonly repo: PatientRepository,
    private readonly leadService: LeadService,
  ) {}

  async findAll(): Promise<PatientEntity[]> {
    return this.repo.findAll();
  }

  async findBySite(siteId: string): Promise<PatientEntity[]> {
    return this.repo.findBySite(siteId);
  }

  async findById(id: string): Promise<PatientEntity> {
    const patient = await this.repo.findById(id);
    if (!patient) throw new NotFoundException(`Patient "${id}" not found.`);
    return patient;
  }

  /**
   * Returns lead data pre-filled as a CreatePatientDto shape.
   * Frontend calls this to populate the conversion form.
   * Lead must be in 'screened' status to be convertible.
   */
  async getPrefilledFromLead(leadId: string): Promise<PrefilledPatientDto> {
    const lead = await this.leadService.findById(leadId);

    if (lead.status !== LeadStatus.SCREENED) {
      throw new BadRequestException(
        `Lead must be in "screened" status to convert. Current status: "${lead.status}".`,
      );
    }

    const existingPatient = await this.repo.findByLeadId(leadId);
    if (existingPatient) {
      throw new ConflictException(
        `Lead "${leadId}" has already been converted to a patient.`,
      );
    }

    return {
      leadId: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      email: lead.email,
      dob: lead.dob,
    };
  }

  /**
   * Creates a patient from a lead.
   * Validates lead is screened, not already converted.
   * Sets lead status to converted atomically.
   */
  async create(dto: CreatePatientDto): Promise<PatientEntity> {
    const lead = await this.leadService.findById(dto.leadId);

    if (lead.status !== LeadStatus.SCREENED) {
      throw new BadRequestException(
        `Lead must be in "screened" status to convert. Current status: "${lead.status}".`,
      );
    }

    const existingPatient = await this.repo.findByLeadId(dto.leadId);
    if (existingPatient) {
      throw new ConflictException(
        `Lead "${dto.leadId}" has already been converted to a patient.`,
      );
    }

    const patient = this.repo.create(dto);
    const saved = await this.repo.save(patient);

    await this.leadService.updateStatus(dto.leadId, {
      status: LeadStatus.CONVERTED,
    });

    return saved;
  }

  async update(id: string, dto: UpdatePatientDto): Promise<PatientEntity> {
    const patient = await this.findById(id);
    Object.assign(patient, dto);
    return this.repo.save(patient);
  }

  async remove(id: string): Promise<{ message: string }> {
    const patient = await this.findById(id);
    await this.repo.remove(patient);
    return { message: `Patient "${id}" deleted successfully.` };
  }
}
