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
import { EncryptionTransformer } from '../../common/encryption/encryption.tranformer';
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

  @Column({ type: 'varchar', length: 255,transformer:EncryptionTransformer })
  dbName: string;

  @Column({ type: 'varchar', length: 255,transformer:EncryptionTransformer })
  dbHost: string;

  @Column({ type: 'int', default: 5432,transformer:EncryptionTransformer })
  dbPort: number;

  @Column({ type: 'varchar', length: 255,transformer:EncryptionTransformer })
  dbUser: string;

  @Column({ type: 'varchar', length: 255,transformer:EncryptionTransformer })
  dbPassword: string;

  // ----------------------------------------------------------------

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn() 
  updatedAt: Date;
}