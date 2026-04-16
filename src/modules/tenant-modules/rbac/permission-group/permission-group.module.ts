// src/modules/tenant-modules/rbac/permission-group/permission-group.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { provideTenantRepository } from '../../../../database/tenant/tenant-repository.helper';
import { TenantModule } from '../../../tenant/tenant.module';
import { UserModule } from '../../user/user.module';
import { PermissionEntity } from '../permission/permission.entity';
import { PermissionRepository } from '../permission/permission.repository';
import { PermissionGroupController } from './permission-group.controller';
import { PermissionGroupEntity } from './permission-group.entity';
import { PermissionGroupRepository } from './permission-group.repository';
import { PermissionGroupService } from './permission-group.service';

@Module({
  imports: [TenantModule, forwardRef(() => UserModule)],
  controllers: [PermissionGroupController],
  providers: [
    PermissionGroupService,
    PermissionGroupRepository,
    PermissionRepository, // ✅ needed for CRUD auto seed
    provideTenantRepository(PermissionGroupEntity),
    provideTenantRepository(PermissionEntity), // ✅ needed for CRUD auto seed
  ],
  exports: [PermissionGroupService, PermissionGroupRepository],
})
export class PermissionGroupModule {}
