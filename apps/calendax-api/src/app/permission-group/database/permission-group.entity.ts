import { Column, Entity, OneToMany } from "typeorm";
import { BaseOrmEntity } from "../../utils/bse-orm/base.orm-entity";
import { Permission } from "../../permission/database/permission.entity";

@Entity({ name: 'permission_group'})
export class PermissionGroup extends BaseOrmEntity {
    @Column({
        name: 'title',
        type: 'varchar',
        nullable: false,
        unique: true,
        length: 60,
    })
    title: string;

    @Column({
        name: 'description',
        type: 'varchar',
        nullable: false,
        length: 160,
    })
    description: string;

    @Column({
        name: 'active',
        type: 'boolean',
        nullable: false,
        default: true,
    })
    active: boolean;

    @OneToMany(() => Permission, (permission) => permission.permissionGroup, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    permissions: Permission[];

    constructor(permission?: Partial<PermissionGroup>) {
        super();
        Object.assign(this, permission);
    }
}