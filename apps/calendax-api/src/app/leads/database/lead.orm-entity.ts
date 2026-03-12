import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseV2OrmEntity } from "../../utils/entities/basev2.orm-entity";
import { Patient } from "../../patient/database/patient.entity";

@Entity('leads')
export class Lead extends BaseV2OrmEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ default: 'outside' })
    source: string;

    @Column({ type: 'jsonb', nullable: true })
    payload?: any;

    @Column({ type: 'boolean', nullable: true, default: false })
    isLinked?: boolean;

    @ManyToOne(() => Patient, (patient) => patient.leads, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'patient_id' })
    patient?: Patient;
}