// src/modules/tenant-modules/rbac/permission/permission.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionGroupEntity } from '../permission-group/permission-group.entity';
import { RoleEntity } from '../role/role.entity';

@Entity('permissions')
export class PermissionEntity {
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

  @ManyToOne(() => PermissionGroupEntity, (g) => g.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: PermissionGroupEntity;

  @ManyToMany(() => RoleEntity, (r) => r.permissions)
  roles: RoleEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
