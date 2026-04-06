// src/modules/tenant-modules/tenant-modules.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RbacModule } from './rbac/rbac.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './auth/otp/otp.module';

@Module({
  imports: [AuthModule, OtpModule, RbacModule, UserModule],
  exports: [AuthModule, OtpModule, RbacModule, UserModule],
})
export class TenantModulesModule {}
