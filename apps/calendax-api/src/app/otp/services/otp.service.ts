import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { OtpRepository } from "../repositories/otp.repository";
import { OtpPurpose } from "../database/otp.entity";
import { EmailService } from "../../utils/mailers/email.service";

@Injectable()
export class OtpService {
    constructor( 
        private readonly otpRepository: OtpRepository,
        private readonly emailService: EmailService,
    ) {}

    private readonly MAX_ATTEMPTS = 3;
    private readonly RATE_LIMIT_MINUTES = 2;
    private readonly OTP_EXPIRY_MINUTES = 10;

    private generateOtp(): string {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        return code;
    }; 


    private async verifyOtp(
        code: string,
        storedCode: string,
    ): Promise<boolean> {
        const compare = code.trim() === storedCode
        return compare; 
    }


    async sendOtp(
        userId: number,
        email: string,
        name: string,
        purpose: OtpPurpose, 
    ): Promise<any> {
        const recentOtpCount = await this.otpRepository.countRecentOtps(
            userId,
            purpose,
            this.RATE_LIMIT_MINUTES,
        );

        if (recentOtpCount > 0) {
            throw new BadRequestException(
                `Please wait ${this.RATE_LIMIT_MINUTES} before trying again`
            );
        };

        await this.otpRepository.deleteUserOtps(userId, purpose);

        const code = this.generateOtp();

        await this.otpRepository.createOtp(
            userId,
            email,
            code,
            purpose,
            this.OTP_EXPIRY_MINUTES,
        );

        try{
            await this.emailService.sendOtp({
                toEmail: email,
                subject: 'Your OTP Code',
                data: {
                    otpCode: code,
                    expiresIn: `${this.OTP_EXPIRY_MINUTES} minutes`,
                },
            });
        } catch (error) {
            throw new BadRequestException('Failed to send OTP, please try again.');
        }
    };


    async verifyAndConsume(
        userId: number,
        code: string,
        purpose: OtpPurpose,
    ): Promise<boolean> {
        const otp = await this.otpRepository.findLatestValidOtp(userId, purpose);

        if(!otp) {
            throw new BadRequestException('No valid Otp found, please request a new one.');
        };

        if(new Date() > otp.expiredAt) {
            throw new BadRequestException ('Otp has expired, please request a new one.');
        };

        if(otp.isUsed) {
            throw new BadRequestException('Otp has already been used, please request a new one.');
        };

        if(otp.attempts >= this.MAX_ATTEMPTS) {
            throw new BadRequestException(
                'Maximum number of attempts exceeded, please request a new Otp.'
            );
        };

        const isValid = await this.verifyOtp(code, otp.code);

        if(!isValid) {
            await this.otpRepository.incrementAttempts(otp.id);
            const remainingAttempts = this.MAX_ATTEMPTS - (otp.attempts + 1);

            if(remainingAttempts > 0) {
                throw new UnauthorizedException(
                    `Invalid Otp code, ${remainingAttempts} attempt(s) remianing.`
                );
            } else {
                throw new UnauthorizedException('Invalid Otp code, maximum attempts exceeded, please request a new Otp.');
            };
        };

        await this.otpRepository.markAsUsed(otp.id);
        return true;
    };
}