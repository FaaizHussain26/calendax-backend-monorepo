import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantUserRoles } from '../../../enums/tenant.enum';
import { PermissionEntity } from '../rbac/permission/permission.entity';
import { RoleEntity } from '../rbac/role/role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 75 })
  firstName: string;

  @Column({ type: 'varchar', length: 75, nullable: true })
  middleName: string;

  @Column({ type: 'varchar', length: 75 })
  lastName: string;

  @Column({ type: 'varchar', length: 191, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 191, select: false })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'enum',
    enum: TenantUserRoles,
    default: TenantUserRoles.TENANT_ADMIN,
  })
  userType: TenantUserRoles;

  @Column({ type: 'uuid', nullable: true })
  roleId: string;

  @ManyToOne(() => RoleEntity, (r) => r.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity;

  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'user_direct_permissions',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
