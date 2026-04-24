import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { AdminPermissions } from './admin-permissions.entity';
import { AdminRoles } from '@libs/common/enums/admin.enum';

@Entity('admins')
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AdminRoles,
    default: AdminRoles.ADMIN,
  })
  role: AdminRoles;

  @OneToMany(() => AdminPermissions, (perm) => perm.admin, {
    cascade: true,
  })
  permissions: AdminPermissions[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
