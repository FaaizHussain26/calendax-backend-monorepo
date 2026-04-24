import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AdminEntity } from './admin.entity';
import { PageEntity } from '../../page/page.entity';
@Entity('admin_permissions')
@Unique(['adminId', 'pageId'])
export class AdminPermissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  adminId: string;

  @ManyToOne(() => AdminEntity, (admin) => admin.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({  })
  admin: AdminEntity;

  @Column({ type: 'uuid' })
  pageId: string;

  @ManyToOne(() => PageEntity, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ })
  page: PageEntity;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'boolean', default: false })
  write: boolean;

  @Column({ type: 'boolean', default: false })
  update: boolean;

  @Column({ type: 'boolean', default: false })
  delete: boolean;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
