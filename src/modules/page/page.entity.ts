import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/entities/admin.entity';

@Entity('page')
export class PageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  slug: string;
  // ✅ Separate the FK column from the relation
  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => AdminEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: AdminEntity;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => AdminEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: AdminEntity;
  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
