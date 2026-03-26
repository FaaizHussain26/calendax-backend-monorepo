import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseOrmEntity } from "../../utils/entities/base.orm-entity";
import { Patient } from "../../patient/database/patient.entity";

@Entity("patient_status")
export class PatientStatus extends BaseOrmEntity {
    @Column({ nullable: true })
    patientId?: number;

    @ManyToOne(() => Patient, { nullable: true })
    @JoinColumn({ name: "patient_id" })
    patient: Patient;

    @Column({ type: "text" })
    status: string;
}