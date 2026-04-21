// src/modules/tenant-modules/tenant-modules.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RbacModule } from './rbac/rbac.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './auth/otp/otp.module';
import { SiteModule } from './site/site.module';
import { IndicationModule } from './indication/indication.module';
import { ProtocolModule } from './protocol/protocol.module';
import { QuestionModule } from './question/question.module';
import { BusinessConfigModule } from './business-config/business-config.module';
import { AgentConfigModule } from './agent-config/agent-config.module';
import { FacebookModule } from './facebook/facebook.module';
// import { SiteModule } from './site/site.module';

@Module({
  imports: [
    AuthModule,
    OtpModule,
    RbacModule,
    UserModule,
    SiteModule,
    ProtocolModule,
    IndicationModule,
    QuestionModule,
    BusinessConfigModule,
    AgentConfigModule,
    FacebookModule,
  ],
  exports: [
    AuthModule,
    OtpModule,
    RbacModule,
    UserModule,
    SiteModule,
    ProtocolModule,
    IndicationModule,
    QuestionModule,
    BusinessConfigModule,
    AgentConfigModule,
    FacebookModule,
  ],
})
export class TenantModulesModule {}
