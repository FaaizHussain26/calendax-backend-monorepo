// src/modules/tenant-modules/rbac/role/role.module.ts
import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { RoleEntity } from './role.entity';
import { PermissionModule } from '../permission/permission.module';
import { provideTenantRepository } from '../../../../common/database/tenant/tenant-repository.helper';
import { TenantModule } from '../../../tenant/tenant.module';

@Module({
  imports: [
    TenantModule,
    PermissionModule, // ✅ for permission validation
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, provideTenantRepository(RoleEntity)],
  exports: [RoleService, RoleRepository],
})
export class RoleModule {}
