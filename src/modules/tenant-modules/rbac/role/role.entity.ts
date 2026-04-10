// src/modules/tenant-modules/rbac/role/role.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionEntity } from '../permission/permission.entity';
import { UserEntity } from '../../user/user.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean; // ✅ auto assigned to new users if true

  @ManyToMany(() => PermissionEntity, (p) => p.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[];

  @OneToMany(() => UserEntity, (u) => u.role)
  users: UserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
