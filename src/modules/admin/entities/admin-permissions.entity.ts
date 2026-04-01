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
@Unique(['admin', 'page'])
export class AdminPermissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({ type: 'uuid' })
  adminId: string;

  @ManyToOne(() => AdminEntity, (admin) => admin.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'adminId' })
  admin: AdminEntity;


  @Column({ type: 'uuid' })
  pageId: string; 

  @ManyToOne(() => PageEntity, {
    onDelete: 'CASCADE',
    eager: true, 
  })
  @JoinColumn({ name: 'pageId' })
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
