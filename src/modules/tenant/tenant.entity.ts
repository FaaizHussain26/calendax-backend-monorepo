// src/modules/tenant/tenant.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/entities/admin.entity';
import { TenantStatus } from '@libs/common/enums/tenant.enum';
import { EncryptionTransformer } from '@libs/common/encryption/encryption.tranformer';
import { AdminPermissionGroupEntity } from '../permission-group/permission-group.entity';
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

  @ManyToMany(() => AdminPermissionGroupEntity)
  @JoinTable({
    name: 'tenant_permission_groups',
    joinColumn: { name: 'tenant_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'permission_group_id',
      referencedColumnName: 'id',
    },
  })
  permissionGroups: AdminPermissionGroupEntity[];

  // ✅ Separate the FK column from the relation
  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => AdminEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({  })
  createdBy: AdminEntity;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => AdminEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({  })
  updatedBy: AdminEntity;

  // -------- Tenant DB credentials (for connection manager) --------

  @Column({ type: 'varchar', length: 255, transformer: EncryptionTransformer })
  dbName: string;

  @Column({ type: 'varchar', length: 255, transformer: EncryptionTransformer })
  dbHost: string;

  @Column({ type: 'int', default: 5432 })
  dbPort: number;

  @Column({ type: 'varchar', length: 255, transformer: EncryptionTransformer })
  dbUser: string;

  @Column({ type: 'varchar', length: 255, transformer: EncryptionTransformer })
  dbPassword: string;

  @Column({ type: 'varchar', length: 255, transformer: EncryptionTransformer })
  mongoUri: string;

  // ----------------------------------------------------------------

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
