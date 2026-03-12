import { Column, Entity, ManyToOne, Unique } from "typeorm";
import { BaseOrmEntity } from "../../utils/entities/base.orm-entity";
import { Patient } from "../../patient/database/patient.entity";
import { Site } from "../../site/database/site.entity";

@Entity('patient_sites')
@Unique(['patient', 'protocolId'])
export class PatientSite extends BaseOrmEntity {
    @ManyToOne(() => Patient, (patient) => patient.patientSites, {
        onDelete: 'CASCADE'
    })
    patient: Patient;

    @ManyToOne(() => Site, (site) => site.patientSites, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    site: Site;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255 })
    protocolId: string;

    constructor(patientSIte?: Partial<PatientSite>) {
        super();
        Object.assign(this, patientSIte);
    }
}