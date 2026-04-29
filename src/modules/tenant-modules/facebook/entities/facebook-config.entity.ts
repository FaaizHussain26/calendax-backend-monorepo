import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('facebook_configs')
export class FacebookConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  appId: string;

  @Column()
  appSecret: string;

@Column({ type: 'varchar', nullable: true, default: null })
accessToken: string | null;

  @Column({ type: 'boolean', default: false })
  isConnected: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
