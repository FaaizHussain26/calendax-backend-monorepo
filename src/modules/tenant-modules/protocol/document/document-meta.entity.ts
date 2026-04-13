import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProtocolEntity } from '../protocol.entity';

@Entity('protocol_document_meta')
export class ProtocolDocumentMetaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  protocolId: string;

  @ManyToOne(() => ProtocolEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  protocol: ProtocolEntity;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column({ default: false })
  isUploaded: boolean;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;
  @Column({ nullable: true })
  publicUrl: string;

  @Column({ type: 'int' })
  fileSize: number;

  @Column({ type: 'int', default: 0 })
  totalPages: number;

  @Column({ type: 'int', default: 0 })
  totalChunks: number;

  @Column({ default: false })
  isProcessed: boolean;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ default: true })
  isCurrent: boolean;

  @Column({ nullable: true })
  replacedAt: Date;

  @Column({ nullable: true })
  replacedById: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
