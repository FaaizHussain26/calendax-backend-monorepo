// auth/otp/otp.controller.ts
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SendOtpDto, VerifyOtpDto } from './otp.dto';
import { OtpService } from './otp.service';
import { TenantGuard } from '@libs/common/guards/tenant.guard';
import type { TenantRequest } from '@libs/common/interfaces/request.interface';

@Controller('auth/otp')
@UseGuards(TenantGuard)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.otpService.generateAndSend(dto.email, dto.purpose);
  }

  @Post('verify')
  verifyOtp(@Body() dto: VerifyOtpDto, @Request() req: TenantRequest) {
    return this.otpService.verify(dto.email, dto.code, dto.purpose, req.tenantId);
  }
}
