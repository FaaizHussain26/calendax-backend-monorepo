import { BaseOrmEntity } from "../../utils/bse-orm/base.orm-entity";
import { Column, Entity, ManyToMany, OneToOne } from "typeorm";
import { UserStatus } from "../../utils/value-objects/user-status.vo";
import type { PlainPassword } from "../../utils/value-objects/password.vo";
import { Exclude } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { Patient } from "../../patient/database/patient.entity";
import { Site } from "../../site/database/site.entity";

@Entity('users')
export class User extends BaseOrmEntity{
    @Column({
        name: 'firstName',
        type: 'varchar',
        length: 75,
        nullable: false
    })
    @IsNotEmpty()
    firstName: string;

    @Column({
        name: 'middleName',
        type: 'varchar',
        length: 191,
        nullable: true
    })
    middleName: string;

    @Column({
        name: 'lastName',
        type: 'varchar',
        length: 75,
        nullable: false
    })
    lastName: string;

    @Column({
        name: 'email',
        type: 'varchar',
        length: 191,
        nullable: false,
        unique: true
    })
    email: string;

    @Column({
        name: 'emailVerifiedAt',
        type: 'timestamp',
        nullable: true
    })
    emailVerifiedAt?: Date;

    @Exclude()
    @Column({
        name: 'password',
        type: 'varchar',
        length: 191,
        nullable: false
    })
    password: PlainPassword;

    @Column({
        name: 'passwordExpiresAt',
        type: 'timestamp',
        nullable: true,
        default: '2025-04-25 19:52:06'
    })
    passwordExpiresAt: Date;

    @Column({
        name: 'phoneNumber1',
        type: 'varchar',
        length: 191,
        nullable: true
    })
    phoneNumber1?: string;

    @Column({
        name: 'phoneNumber2',
        type: 'varchar',
        length: 191,
        nullable: true
    })
    phoneNumber2?: string;

    @Column({
        name: 'failedAttempts',
        type: 'int',
        nullable: true,
        default: 0
    })
    failedAttempts: number;

    @Column({
        name: 'isPasswordReset',
        type: 'boolean',
        nullable: true,
        default: 0
    })
    isPasswordReset: boolean;

    @Column({
        name: 'isNotificationEnabled',
        type: 'boolean',
        nullable: true,
        default: 0
    })
    isNotificationEnabled: boolean;

    @Column({
        name: 'lastFailedAttempt',
        type: 'timestamp',
        nullable: true
    })
    lastFailedAttempt?: Date;

    @Column({
        name: 'lockedUntil',
        type: 'timestamp',
        nullable: true
    })
    lockedUntil?: Date;

    @Column({
        name: 'isPatient',
        type: 'boolean',
        nullable: true,
        default: true
    })
    isPatient?: boolean;

    @OneToOne(() => Patient, (patient) => patient.id)
    patient: Patient;

    @ManyToMany(() => Site, (site) => site.principleInvetigators)
    sites: Site[]

    @Column({
        name: 'isAdmin',
        type: 'boolean',
        nullable: true,
        default: false
    })
    isAdmin: boolean;

    @Column({
        name: 'isPrincipalInvestigator',
        type: 'boolean',
        nullable: true,
        default: false
    })
    isPrincipalInvestigator: boolean;

    @Column({
        name: 'isSuperUser',
        type: 'boolean',
        nullable: true,
        default: false
    })
    isSuperUser: boolean;

    @Column({
        name: 'status',
        type: 'enum',
        enum: UserStatus,
        nullable: false
    })
    status: UserStatus;
}