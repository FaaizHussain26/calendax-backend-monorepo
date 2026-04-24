import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { SiteEntity } from '../site/site.entity';
import { LeadEntity } from '../lead/lead.entity';

@Entity('patients')
export class PatientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  leadId: string;

  @OneToOne(() => LeadEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leadId' })
  lead: LeadEntity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string

  @Column({ type: 'date', nullable: true })
  dob: string

  @Column({ type: 'uuid' })
  siteId: string;

  @ManyToOne(() => SiteEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'siteId' })
  site: SiteEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
