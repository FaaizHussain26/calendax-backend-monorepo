// src/modules/admin/permission/permission.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminPermissionGroupEntity } from '../permission-group/permission-group.entity';

@Entity('permissions')
export class AdminPermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  key: string; // 'appointments.create'

  @Column({ type: 'varchar', length: 60 })
  name: string; // 'Create Appointments'

  @Column({ type: 'varchar', length: 160, nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  groupId: string;

  @ManyToOne(() => AdminPermissionGroupEntity, (g) => g.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: AdminPermissionGroupEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
