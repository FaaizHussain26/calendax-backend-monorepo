import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PermissionGroupEntity } from "../permission-group/permission-group.entity";
import { RoleEntity } from "../role/role.entity";

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  key: string;                     // was 'slug' — renamed to 'key' for clarity
                                   // e.g. "appointments.create"
  @Column({ type: 'varchar', length: 60 })
  name: string;                    // e.g. "Create Appointments"

  @Column({ type: 'varchar', length: 160, nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  groupId: string;

  @ManyToOne(() => PermissionGroupEntity, (g) => g.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: PermissionGroupEntity;

  @ManyToMany(() => RoleEntity, (r) => r.permissions)
  roles: RoleEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()             
  deletedAt: Date;
}