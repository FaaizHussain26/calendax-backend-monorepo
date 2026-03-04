import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThan, Repository } from "typeorm";
import { OTP, OtpPurpose, OtpStatus } from "../database/otp.entity";

@Injectable()
export class OtpRepository {
    constructor(
        @InjectRepository(OTP) 
        private readonly otpRepository: Repository<OTP>
    ) {}

    async createOtp(
        userId: number,
        email: string,
        code: string,
        purpose: OtpPurpose,
        expiresIn,
    ): Promise<OTP> {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expiresIn)

        const createdAt = new Date();

        const otp = this.otpRepository.create({
            userId: userId,
            email: email,
            code: code,
            purpose: purpose,
            createdAt: createdAt,
            expiredAt: expiresAt,
            status: OtpStatus.PENDING,
        });

        return this.otpRepository.save(otp);
    };


    async findLatestValidOtp(
        userId: number,
        purpose: OtpPurpose,
    ): Promise<OTP | null> {
        return this.otpRepository.findOne({
            where: {
                userId,
                purpose,
                isUsed: false,
                expiredAt: MoreThan(new Date()),
            }
        });
    };

    
    async findById(id: number): Promise<OTP | null> {
        return this.otpRepository.findOne({where: {id}});
    };


    async markAsUsed(id: number): Promise<void> {
        await this.otpRepository.update(id, {isUsed: true});
    };


    async incrementAttempts(id: number): Promise<void> {
        await this.otpRepository.increment({id}, 'attempts', 1);
    };


    async deleteExpired(): Promise<void> {
        await this.otpRepository.delete({
            expiredAt: LessThan(new Date()),
        });
    };


    async deleteUserOtps(
        userId: number,
        purpose: OtpPurpose,
    ): Promise<void> {
        await this.otpRepository.delete({
            userId,
            purpose,
            isUsed: true,
        });
    };


    async countRecentOtps(
        userId: number,
        purpose: OtpPurpose,
        minutesAgo: number,
    ): Promise<number> {
        const sinceTime = new Date();
        sinceTime.setMinutes(sinceTime.getMinutes() - minutesAgo);

        return this.otpRepository.count({
            where: {
                userId,
                purpose,
                createdAt: MoreThan(new Date()),
            }
        });
    };
}