// src/modules/tenant-modules/rbac/permission/permission.module.ts
import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './permission.repository';
import { PermissionEntity } from './permission.entity';
import { PermissionGroupModule } from '../permission-group/permission-group.module';
import { provideTenantRepository } from '@libs/database/tenant-repository.helper';
import { TenantModule } from '../../../tenant/tenant.module';

@Module({
  imports: [
    TenantModule,
    PermissionGroupModule, // ✅ for group validation
  ],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository, provideTenantRepository(PermissionEntity)],
  exports: [PermissionService, PermissionRepository],
})
export class PermissionModule {}
