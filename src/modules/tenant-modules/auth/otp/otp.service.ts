// src/modules/tenant-modules/auth/otp/otp.service.ts
import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { randomUUID } from 'crypto';
import { OtpPurpose } from '../../../../enums/system.enum';
import { OtpRepository } from './otp.repository';
import { AuthService } from '../auth.service';
import { UsersService } from '../../user/user.service';
import { UsersRepository } from '../../user/user.repository';
import { ConfigService } from '@nestjs/config';
import { HelperFunctions } from '../../../../common/utils/functions';
import { RedisHelper } from '../../../../common/redis/redis.helper';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly otpRepo: OtpRepository,
    private readonly authService: AuthService,
    private readonly userRepo: UsersRepository,
    private readonly config: ConfigService,
    private readonly redisHelper: RedisHelper,
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
    tenantId: string,
  ): Promise<{ verified: boolean; verificationId?: string; authToken?: any }> {
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
    if (
      this.config.get<string>('NODE_ENV') === 'development' &&
      code == '1234'
    ) {
      console.log('Bypassing default otp');
    } else {
      const isValid = await bcrypt.compare(code, otp.code);

      if (!isValid) {
        await this.otpRepo.update(otp.id, {
          attempts: otp.attempts + 1,
        });
        throw new BadRequestException(
          `Invalid OTP. ${this.MAX_ATTEMPTS - (otp.attempts + 1)} attempts remaining`,
        );
      }
    }
    await this.otpRepo.update(otp.id, { verified: true });
    await this.invalidate(email, purpose);
    if (purpose === OtpPurpose.VERIFICATION) {
      const user = await this.userRepo.findByEmail(email);
      if (!user) return { verified: true };

      return {
        verified: true,
        authToken: await this.authService.issueTokenForUser(user.id, tenantId), // ← use TokenService
      };
    } else if (purpose === OtpPurpose.RESET_PASSWORD) {
      let key = randomUUID();
      await this.redisHelper.set(`reset_password:${key}`, otp.email, 15 * 60);
      return { verified: true, verificationId: key };
    }
    return { verified: true };
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
