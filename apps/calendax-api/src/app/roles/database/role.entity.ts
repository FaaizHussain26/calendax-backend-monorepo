import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseOrmEntity } from "../../utils/bse-orm/base.orm-entity";
import { Permission } from "../../permission/database/permission.entity";

@Entity({ name: 'roles' })
export class Role extends BaseOrmEntity {
    @Column({
        name: 'name',
        type: 'varchar',
        unique: true,
        nullable: false,
        length: 50,
    })
    name: string;

    @Column({
        name: 'active',
        type: 'boolean',
        nullable: false,
        default: true,
    })
    active: boolean;

    @ManyToMany(() => Permission, (permission) => permission.id, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinTable({
        name: 'roles_permissions',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id'
        },
    })
    permissions: Permission[];

    constructor(role?: Partial<Role>) {
        super();
        Object.assign(this, role);
    }
}