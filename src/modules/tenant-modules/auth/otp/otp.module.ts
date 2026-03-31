// auth/otp/otp.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { OtpService } from './otp.service';

@Module({
  imports: [
    UserModule
  ],
  providers: [OtpService],
//   controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}