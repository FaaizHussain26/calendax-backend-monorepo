import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('facebook_forms')
export class FacebookFormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, comment: 'Facebook form ID from Graph API' })
  formId: string;

  @Column()
  formName: string;

  @Column()
  pageId: string;

  @Column()
  pageName: string;

  @Column({ type: 'uuid' })
  protocolId: string;

  @Column({ type: 'uuid', nullable: true })
  callingConfigId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
