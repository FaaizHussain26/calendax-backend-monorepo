import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PatientRepository } from './patient.repository';
import { PatientEntity } from './patient.entity';
import { LeadModule } from '../lead/lead.module';
import { provideTenantRepository } from '@libs/database/tenant-repository.helper';

@Module({
  imports: [LeadModule],
  controllers: [PatientController],
  providers: [
    PatientService,
    PatientRepository,
    provideTenantRepository(PatientEntity),
  ],
  exports: [PatientService],
})
export class PatientModule {}
