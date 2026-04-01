// src/modules/tenant-modules/auth/otp/otp.service.ts
import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


import { randomUUID } from 'crypto';
import { OtpPurpose } from '../../../../enums/system.enum';
import { OtpRepository } from './otp.repository';

@Injectable({ scope: Scope.REQUEST })
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    @Inject('OtpEntityRepository')
    private readonly otpRepo: OtpRepository,
    // private readonly emailService: EmailService,
  ) {}


  async generateAndSend(email: string, purpose: OtpPurpose) {
    await this.invalidateExisting(email, purpose);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    await this.otpRepo.create({
      email: email,
      code: hashedOtp,
      expiresAt,
      purpose,
      verified: false,
      attempts: 0,
    });

    // await this.emailService.sendOtp({
    //   toEmail: email,
    //   subject: 'Your OTP Code',
    //   data: {
    //     otpCode,
    //     expiresIn: `${this.OTP_EXPIRY_MINUTES} minutes`,
    //   },
    // });

    return { message: 'OTP sent successfully' };
  }

  async verify(
    email: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<{ verified: boolean; verificationToken: string }> {
    const otp = await this.otpRepo.findLatestUnverified(email, purpose);

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    if (otp.attempts >= this.MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many attempts. Please request a new OTP',
      );
    }

    const isValid = await bcrypt.compare(code, otp.code);

    if (!isValid) {
      await this.otpRepo.update(otp.id, {
        attempts: otp.attempts + 1,
      });
      throw new BadRequestException(
        `Invalid OTP. ${this.MAX_ATTEMPTS - (otp.attempts + 1)} attempts remaining`,
      );
    }

    await this.otpRepo.update(otp.id, { verified: true });

    return {
      verified: true,
      verificationToken: randomUUID(), // caller can use this as a one-time proof
    };
  }

  async invalidate(email: string, purpose: OtpPurpose): Promise<void> {
    await this.invalidateExisting(email, purpose);
  }

  private async invalidateExisting(
    email: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    await this.otpRepo.invalidateExisting(email, purpose);
  }

  async sendWelcomeEmail(
    email: string,
    name: string,
    tempPassword: string,
  ): Promise<void> {
    // await this.emailService.sendWelcome({
    //   toEmail: email,
    //   subject: 'Welcome! Your account has been created',
    //   data: {
    //     name,
    //     tempPassword,
    //   },
    // });
  }

  async deleteExpired(): Promise<void> {
    await this.otpRepo.deleteExpired();
  }
}
