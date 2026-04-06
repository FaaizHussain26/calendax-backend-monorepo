import { Module } from '@nestjs/common';
import { PermissionGroupModule } from './permission-group/permission-group.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [PermissionGroupModule, PermissionModule, RoleModule],
  exports: [PermissionGroupModule, PermissionModule, RoleModule],
})
export class RbacModule {}
