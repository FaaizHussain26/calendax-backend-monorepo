// site.entity.ts - cleaned up
import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserEntity } from '../user/user.entity';
import { ProtocolEntity } from '../protocol/protocol.entity';
import { IndicationEntity } from '../indication/indication.entity';

@Entity('sites')
export class SiteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false })
  prefix: string;
  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  siteNumber: string;

  @Column({ default: 0 })
  patientCount: number;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  streetAddress: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  indicationId: string;
  @ManyToOne(() => IndicationEntity, (indication) => indication.sites,{
  nullable: true,
  onDelete: 'SET NULL',
})
  indication: IndicationEntity;

  @ManyToMany(() => UserEntity, (user) => user.sites)
  users: UserEntity[];

  @ManyToMany(() => ProtocolEntity, (protocol) => protocol.sites)
  protocols: ProtocolEntity[];

  //   @OneToMany(() => PatientSite, (ps) => ps.site)
  //   patientSites: PatientSite[];

  @CreateDateColumn({})
  @Exclude()
  public createdAt: Date;

  @UpdateDateColumn({})
  @Exclude()
  public updatedAt: Date;

  @DeleteDateColumn({})
  @Exclude()
  public deletedAt: Date;
}
