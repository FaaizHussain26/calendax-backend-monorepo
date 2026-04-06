// auth/otp/otp.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { OtpService } from './otp.service';
import { TenantModule } from '../../../tenant/tenant.module';
import { OtpController } from './otp.controller';
import { OtpRepository } from './otp.repository';
import { provideTenantRepository } from '../../../../common/database/tenant/tenant-repository.helper';
import { OtpEntity } from './otp.entity';
import { AuthModule } from '../auth.module';

@Module({
  imports: [AuthModule, TenantModule, UserModule],
  controllers: [OtpController],
  providers: [OtpService, OtpRepository, provideTenantRepository(OtpEntity)],
  exports: [OtpService, OtpRepository],
})
export class OtpModule {}
