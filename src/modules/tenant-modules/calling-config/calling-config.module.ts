import { Module } from '@nestjs/common';
import { CallingConfigService } from './calling-config.service';
import { CallingConfigController } from './calling-config.controller';
import { CallingConfigRepository } from './calling-config.repository';
import { provideTenantRepository } from '@libs/database/tenant-repository.helper';
import { CallingConfigEntity } from './calling-config.entity';
import { AwsModule } from '@libs/aws/aws.module';

@Module({
  imports: [AwsModule],
  controllers: [CallingConfigController],
  providers: [
    CallingConfigService,
    CallingConfigRepository,
    provideTenantRepository(CallingConfigEntity),
  ],
  exports: [CallingConfigService],
})
export class CallingConfigModule {}