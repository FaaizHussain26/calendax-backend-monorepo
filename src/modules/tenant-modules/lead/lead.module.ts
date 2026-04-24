import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { LeadRepository } from './lead.repository';
import { LeadEntity } from './lead.entity';
import { provideTenantRepository } from '@libs/database/tenant-repository.helper';

@Module({
  imports: [],
  controllers: [LeadController],
  providers: [
    LeadService,
    LeadRepository,
    provideTenantRepository(LeadEntity),
  ],
  exports: [LeadService],
})
export class LeadModule {}
