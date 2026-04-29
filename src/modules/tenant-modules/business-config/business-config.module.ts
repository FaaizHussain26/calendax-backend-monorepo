import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessConfigService } from './business-config.service';
import { BusinessConfigController } from './business-config.controller';
import { provideTenantRepository } from '../../../database/tenant/tenant-repository.helper';
import { BusinessConfigEntity } from './business-config.entity';
import { BusinessConfigRepository } from './business-config.repository';

@Module({
  imports: [],
  controllers: [BusinessConfigController],
  providers: [BusinessConfigService,BusinessConfigRepository,provideTenantRepository(BusinessConfigEntity)],
  exports: [BusinessConfigService],
})
export class BusinessConfigModule {}
