// indication.module.ts
import { Module } from '@nestjs/common';
import { IndicationEntity } from './indication.entity';
import { IndicationRepository } from './indication.repository';
import { IndicationService } from './indication.service';
import { IndicationController } from './indication.controller';
import { provideTenantRepository } from '@libs/database/tenant-repository.helper';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  providers: [IndicationService, IndicationRepository, provideTenantRepository(IndicationEntity)],
  controllers: [IndicationController],
  exports: [IndicationService, IndicationRepository],
})
export class IndicationModule {}
