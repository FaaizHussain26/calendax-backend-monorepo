// src/modules/tenant-modules/tenant-modules.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RbacModule } from './rbac/rbac.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './auth/otp/otp.module';
import { SiteModule } from './site/site.module';
import { IndicationModule } from './indication/indication.module';
import { ProtocolModule } from './protocol/protocol.module';
// import { SiteModule } from './site/site.module';

@Module({
  imports: [AuthModule, OtpModule, RbacModule, UserModule,SiteModule,ProtocolModule,IndicationModule],
  exports: [AuthModule, OtpModule, RbacModule, UserModule,SiteModule,ProtocolModule,IndicationModule],
})
export class TenantModulesModule {}
