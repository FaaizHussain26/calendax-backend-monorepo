import { Column, Entity, ManyToOne } from "typeorm";
import { BaseOrmEntity } from "../../utils/entities/base.orm-entity";
import { Patient } from "../../patient/database/patient.entity";
import { AppointmentStatus } from "../../utils/value-objects/appointment-status.vo";
import { Site } from "../../site/database/site.entity";
import { User } from "../../user/database/user.orm";

@Entity("patient_appointments")
export class PatientAppointment extends BaseOrmEntity {
    @ManyToOne(() => Patient, (patient) => patient.patientAppointments, {
        onDelete: 'CASCADE',
        cascade: true,
    })
    patient: Patient;

    @Column({ type: "date", nullable: true })
    date: Date;

    @Column({ type: "varchar", length: 191, nullable: true })
    time: string;

    @Column({
        type: "enum",
        enum: AppointmentStatus,
        default: AppointmentStatus.Pending,
    })
    status: AppointmentStatus;

    @Column({ type: "text", nullable: true })
    protocol_id: string;

    @Column({ type: "text", nullable: true })
    indication: string;

    @ManyToOne(() => Site, (site) => site.patientAppointments, {
        onDelete: "CASCADE",
    })
    site: Site;

    @ManyToOne(() => User, (user) => user.patientAppointments)
    user: User;
}