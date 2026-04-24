import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SiteEntity } from '../site/site.entity';
import { LeadSource, LeadStatus } from '@libs/common/enums/lead.enum';
import { ProtocolEntity } from '../protocol/protocol.entity';
import { CallingConfigEntity } from '../calling-config/calling-config.entity';
import { FacebookFormEntity } from '../facebook/entities/facebook-form.entity';

@Entity('leads')
export class LeadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  dob: string;

  @Column({ nullable: true })
  bestTimeToCall: string;

  @Column({ type: 'enum', enum: LeadSource })
  source: LeadSource;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.PENDING })
  status: LeadStatus;

  @Column({ type: 'uuid' })
  protocolId: string;

  @ManyToOne(() => ProtocolEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'protocolId' })
  protocol: ProtocolEntity;

  @Column({ type: 'uuid', nullable: true })
  callingConfigId: string;

  @ManyToOne(() => CallingConfigEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'callingConfigId' })
  callingConfig: CallingConfigEntity;

  @Column({ type: 'uuid', nullable: true })
  facebookFormId: string;

  @ManyToOne(() => FacebookFormEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'facebookFormId' })
  facebookForm: FacebookFormEntity;

  @Column({ type: 'uuid', nullable: true })
  siteId: string;

  @ManyToOne(() => SiteEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'siteId' })
  site: SiteEntity;

  @Column({ type: 'int', default: 0 })
  callAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastCalledAt: Date;

  @Column({ type: 'text', nullable: true })
  transcript: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}