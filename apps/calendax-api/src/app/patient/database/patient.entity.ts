import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseOrmEntity } from "../../utils/bse-orm/base.orm-entity";
import { BestTimeToCallEnum, PatientStatusEnum } from "../../utils/value-objects/patient-status.enum";
import { User } from "../../user/database/user.orm";

@Entity("patients")
export class Patient extends BaseOrmEntity {
    @Column({ type: "date", nullable: true })
    dob: Date;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ type: "text", nullable: true })
    address: string;

    @Column({ type: "varchar", length: 191, nullable: true })
    smsCode: string;

    @Column({ type: "text", nullable: true })
    streetAddress: string;

    @Column({ type: "varchar", length: 256, nullable: true })
    apartmentNumber: string;

    @Column({ type: "varchar", length: 256, nullable: true })
    state: string;

    @Column({ type: "varchar", length: 256, nullable: true })
    city: string;

    @Column({ type: "varchar", length: 10, nullable: true })
    zipCode: string;

    @Column({ type: "int", nullable: true })
    age: number;

    @Column({
        type: "enum",
        enum: PatientStatusEnum,
        default: PatientStatusEnum.no_response
    })
    status: PatientStatusEnum;

    @OneToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @Column({ type: "text", nullable: true, default: null })
    indication: string;

    @Column({ type: "text", nullable: true, default: null })
    source: string;

    @Column({
        type: "enum",
        enum: BestTimeToCallEnum,
        default: BestTimeToCallEnum.morning
    })
    bestTimeToCall: BestTimeToCallEnum;

    constructor(patient?: Partial<Patient>) {
        super();
        Object.assign(this, patient)
    }
}