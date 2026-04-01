// src/modules/tenant-modules/rbac/permission-group/permission-group.module.ts
import { Module } from '@nestjs/common';
import { PermissionGroupController } from './permission-group.controller';
import { PermissionGroupService } from './permission-group.service';
import { PermissionGroupRepository } from './permission-group.repository';
import { PermissionGroupEntity } from './permission-group.entity';
import { PermissionEntity } from '../permission/permission.entity';
import { provideTenantRepository } from '../../../../common/database/tenant/tenant-repository.helper';
import { PermissionRepository } from '../permission/permission.repository';
import { TenantModule } from '../../../tenant/tenant.module';

@Module({
   imports: [
    TenantModule,                           
  ],
  controllers: [PermissionGroupController],
  providers: [
    PermissionGroupService,
    PermissionGroupRepository,
    PermissionRepository,                          // ✅ needed for CRUD auto seed
    provideTenantRepository(PermissionGroupEntity),
    provideTenantRepository(PermissionEntity),     // ✅ needed for CRUD auto seed
  ],
  exports: [PermissionGroupService, PermissionGroupRepository],
})
export class PermissionGroupModule {}