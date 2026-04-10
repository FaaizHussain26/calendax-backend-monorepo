// src/modules/page/page.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/entities/admin.entity';

@Entity('pages')
export class PageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'varchar', length: 255,nullable:true })
  icon: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  href: string;

  @Column({nullable:false})
  @Generated('increment')
  index: number;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => AdminEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({  })
  createdBy: AdminEntity;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => AdminEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ })
  updatedBy: AdminEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
