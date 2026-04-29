import { Module } from '@nestjs/common';
import { CallingConfigService } from './calling-config.service';
import { CallingConfigController } from './calling-config.controller';
import { CallingConfigRepository } from './calling-config.repository';
import { provideTenantRepository } from '../../../database/tenant/tenant-repository.helper';
import { CallingConfigEntity } from './calling-config.entity';

@Module({
  imports: [],
  controllers: [CallingConfigController],
  providers: [
    CallingConfigService,
    CallingConfigRepository,
    provideTenantRepository(CallingConfigEntity),
  ],
  exports: [CallingConfigService],
})
export class CallingConfigModule {}