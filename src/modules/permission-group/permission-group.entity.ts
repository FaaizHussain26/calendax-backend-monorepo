import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminPermissionEntity } from '../permission/permission.entity';

@Entity('permission_groups')
export class AdminPermissionGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  name: string; // 'Appointments'

  @Column({ type: 'varchar', length: 60, unique: true })
  slug: string; // 'appointments' — auto generated from name
  // used for: permission key generation + frontend

  @Column({ type: 'varchar', length: 255, nullable: true })
  href: string; // '/dashboard/appointments'

  @Column({ type: 'varchar', length: 160, nullable: true })
  description: string;

  @OneToMany(() => AdminPermissionEntity, (p) => p.group, { cascade: true })
  permissions: AdminPermissionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
