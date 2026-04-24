import { Exclude } from 'class-transformer';
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
import { IndicationEntity } from '../indication/indication.entity';
import { SiteEntity } from '../site/site.entity';
import { TenantStatus } from '@libs/common/enums/tenant.enum';
import { ProtocolDocumentStatus, ProtocolStatus } from '@libs/common/enums/protocol.enum';
import { ProtocolDocumentMetaEntity } from './document/document-meta.entity';
@Entity('protocols')
export class ProtocolEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;
  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  documentId: string;

  @OneToMany(() => ProtocolDocumentMetaEntity, (doc) => doc.protocol)
  documents: ProtocolDocumentMetaEntity[]; // all docs

  get currentDocument(): ProtocolDocumentMetaEntity | undefined {
    return this.documents?.find((d) => d.isCurrent);
  }

  @Column({ nullable: false, unique: true })
  protocolNumber: string;

  @Column({
    type: 'enum',
    enum: ProtocolStatus,
    default: ProtocolStatus.ORIGINAL,
  })
  status: ProtocolStatus;
  @Column({
    type: 'enum',
    enum: ProtocolDocumentStatus,
    default: ProtocolDocumentStatus.PENDING,
  })
  documentStatus: ProtocolDocumentStatus;

  @Column({ default: false })
  isUploaded: boolean;

  @Column({ nullable: true })
  indicationId: string;
  @ManyToOne(() => IndicationEntity, (indication) => indication.protocols)
  indication: IndicationEntity;

  @ManyToMany(() => SiteEntity, (site) => site.protocols)
  @JoinTable({
    name: 'site_protocols',
    joinColumn: { name: 'protocol_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'site_id', referencedColumnName: 'id' },
  })
  sites: SiteEntity[];

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
