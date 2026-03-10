import { Column, Entity, ManyToOne } from "typeorm";
import { BaseOrmEntity } from "../../utils/entities/base.orm-entity";
import { PermissionGroup } from "../../permission-group/database/permission-group.entity";

@Entity({ name: "permissions" })
export class Permission extends BaseOrmEntity {
    @Column({
        name: 'name',
        type: 'varchar',
        length: 60,
    })
    name: string;

    @Column({
        name: 'slug',
        type: 'varchar',
        nullable: false,
        unique: true,
        length: 60
    })
    slug: string;

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

    @ManyToOne(() => PermissionGroup, (permissionGroup) => permissionGroup.permissions, {
        onDelete: 'CASCADE'
    })
    permissionGroup: PermissionGroup;

    constructor(permission?: Partial<Permission>) {
        super();
        Object.assign(this, permission);
    }
}