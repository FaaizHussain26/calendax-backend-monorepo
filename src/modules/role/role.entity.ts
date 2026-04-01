// import { PermissionEntity } from "../permission/permission.entity";
// import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// @Entity('roles')
// export class RoleEntity {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ type: 'varchar', length: 50, unique: true })
//   name: string;

//   @Column({ type: 'boolean', default: false })
//   isDefault: boolean;              // auto-assign to new users if true

//   @ManyToMany(() => PermissionEntity, (p) => p.roles)
//   @JoinTable({
//     name: 'role_permissions',
//     joinColumn: { name: 'roleId', referencedColumnName: 'id' },
//     inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
//   })
//   permissions: PermissionEntity[];

//   @OneToMany(() => UserEntity, (u) => u.role)
//   users: UserEntity[];

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @DeleteDateColumn()              // ✅ replaces active:boolean
//   deletedAt: Date;
// }