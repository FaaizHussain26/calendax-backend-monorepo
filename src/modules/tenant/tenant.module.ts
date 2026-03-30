import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantRepository } from './tenant.repository';
import { TenantService } from './tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../admin/entities/admin.entity';
import { TenantEntity } from './tenant.entity';
import { TenantConnectionManager } from '../../common/database/tenant/tenant-connection.module';
import { JwtCommonModule } from '../../common/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity], 'master'),JwtCommonModule],
  controllers: [TenantController],
  providers: [TenantService, TenantRepository, TenantConnectionManager],
  exports: [TenantConnectionManager],
})
export class TenantModule {}
