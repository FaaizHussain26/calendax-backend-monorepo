import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantRepository } from './tenant.repository';
import { TenantService } from './tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../admin/entities/admin.entity';
import { TenantEntity } from './tenant.entity';
import { TenantConnectionManager } from '../../database/tenant/tenant-connection.manager';
import { JwtCommonModule } from '../../services/jwt/jwt.module';
import { AdminPermissionGroupModule } from '../permission-group/permission-group.module';
import { MongoAdminModule } from '../../database/master/mongo-admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity], 'master'), AdminPermissionGroupModule, MongoAdminModule],
  controllers: [TenantController],
  providers: [TenantService, TenantRepository, TenantConnectionManager],
  exports: [TenantRepository, TenantConnectionManager,TenantService],
})
export class TenantModule {}
