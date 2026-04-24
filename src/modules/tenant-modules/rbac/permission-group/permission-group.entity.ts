// src/modules/tenant-modules/rbac/permission-group/permission-group.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionEntity } from '../permission/permission.entity';

@Entity('permission_groups')
export class PermissionGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  href: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  description: string;

  @OneToMany(() => PermissionEntity, (p) => p.group, { cascade: true })
  permissions: PermissionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
