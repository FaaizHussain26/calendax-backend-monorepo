import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProtocolEntity } from '../protocol/protocol.entity';
import { ProtocolDocumentMetaEntity } from '../protocol/document/document-meta.entity';
import { QuestionStatus } from '@libs/common/enums/question.enum';



@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  protocolId: string;

  @ManyToOne(() => ProtocolEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  protocol: ProtocolEntity;

  @Column()
  documentId: string; 

  @ManyToOne(() => ProtocolDocumentMetaEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  document: ProtocolDocumentMetaEntity;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ nullable: true })
  indication: string;

  @Column({
    type: 'enum',
    enum: QuestionStatus,
    default: QuestionStatus.PENDING,
  })
  status: QuestionStatus;


  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}