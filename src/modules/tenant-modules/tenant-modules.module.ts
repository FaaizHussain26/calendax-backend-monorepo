// src/modules/tenant-modules/tenant-modules.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RbacModule } from './rbac/rbac.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, RbacModule, UserModule],
  exports: [AuthModule, RbacModule, UserModule],
})
export class TenantModulesModule {}
