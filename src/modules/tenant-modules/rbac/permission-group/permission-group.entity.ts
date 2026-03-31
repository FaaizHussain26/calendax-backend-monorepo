import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PermissionEntity } from "../permission/permission.entity";

@Entity('permission_groups')
export class PermissionGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  name: string;                    // was 'title' — standardized to 'name'

  @Column({ type: 'varchar', length: 160, nullable: true })
  description: string;

  @OneToMany(() => PermissionEntity, (p) => p.group, { cascade: true })
  permissions: PermissionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()            
  deletedAt: Date;
}