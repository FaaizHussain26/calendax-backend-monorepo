// src/modules/tenant/tenant.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/entities/admin.entity';
import { TenantStatus } from '../../enums/tenant.enum';
@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.PROVISIONING,
  })
  status: TenantStatus;

  // ✅ Separate the FK column from the relation
  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => AdminEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: AdminEntity;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => AdminEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: AdminEntity;

  // -------- Tenant DB credentials (for connection manager) --------
  // ✅ Store encrypted in production using a column transformer

  @Column({ type: 'varchar', length: 255 })
  dbName: string;

  @Column({ type: 'varchar', length: 255 })
  dbHost: string;

  @Column({ type: 'int', default: 5432 })
  dbPort: number;

  @Column({ type: 'varchar', length: 255 })
  dbUser: string;

  @Column({ type: 'varchar', length: 255 })
  dbPassword: string;

  // ----------------------------------------------------------------

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn() 
  updatedAt: Date;
}