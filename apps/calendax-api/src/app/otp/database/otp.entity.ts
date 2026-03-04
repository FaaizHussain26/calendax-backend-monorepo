import { User } from "../../user/database/user.orm";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum OtpPurpose {
    GENERAL = 'general',
    VERIFICATION = 'verification',
    RESET_PASSWORD = 'reset_password',
}

export enum OtpStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
}

@Entity('otp')
export class OTP {
    @PrimaryGeneratedColumn('uuid')
    id: number;


    @Column()
    userId: number;

    @Column()
    code: string;

    @Column(
        {
            type: 'enum',
            enum: OtpPurpose
        }
    )
    purpose: OtpPurpose;


    @Column(
        {
            type: 'enum',
            enum: OtpStatus,
            default: OtpStatus.PENDING,
        }
    )
    status: OtpStatus;


    @Column()
    email: string;


    @Column()
    createdAt: Date;


    @Column()
    expiredAt: Date;


    @ManyToOne(() => User, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user: User;


    @Column({default: false})
    isUsed: boolean;


    @Column({default: 0})
    attempts: number;
}