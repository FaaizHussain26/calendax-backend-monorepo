import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, Timestamp, UpdateDateColumn } from "typeorm";
import { BaseOrmEntity } from "../../utils/entities/base.orm-entity";
import { Exclude } from "class-transformer";
import { User } from "../../user/database/user.orm";
import { PatientSite } from "../../patient-site/database/patient-site.entity";

@Entity('sites')
export class Site extends BaseOrmEntity {
    @Column({ nullable: true })
    email: string;

    @Column({ nullable: false })
    prefix: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true, name: "site_number"})
    siteNumber: string;

    @Column({ nullable: true, name: "phone_number"})
    phoneNumber: string;

    streetAddress: string;
    @Column({ nullable: true, name: "street_address"})

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true})
    state: string;

    @Column({ nullable: true, name: "zip_code" })
    zipCode: string;

    @Column({ nullable: true })
    link: string;

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    indication: string;

    @ManyToMany(() => User, (user) => user.sites)
    @JoinTable()
    principleInvetigators: User[]

    @OneToMany(() => PatientSite, (ps) => ps.site)
    patientSites: PatientSite[];

    @CreateDateColumn({ name: "created_at" })
    @Exclude()
    public override createdAt: Timestamp;

    @UpdateDateColumn({ name: "updated_at" })
    @Exclude()
    public override updatedAt?: Timestamp;

    @DeleteDateColumn({ name: "deleted_at" })
    @Exclude()
    public override deletedAt?: Timestamp;
}