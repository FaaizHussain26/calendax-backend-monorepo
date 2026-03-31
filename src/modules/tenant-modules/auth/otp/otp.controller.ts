// auth/otp/otp.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { SendOtpDto, VerifyOtpDto } from './otp.dto';
import { OtpService } from './otp.service';

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.otpService.generateAndSend(dto.email, dto.purpose);
  }

  @Post('verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otpService.verify(dto.email, dto.code, dto.purpose);
  }
}
