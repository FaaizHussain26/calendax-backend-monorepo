import { AdminRoles } from 'src/modules/utils/enums/adminRoles.enum';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { AdminPermissions } from './admin-permissions.entity';

@Entity("admins")
export class AdminEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: AdminRoles,
        default: AdminRoles.ADMIN,
    })
    role: AdminRoles;

    @OneToMany(() => AdminPermissions, (perm) => perm.admin, {
        cascade: true,
    })
    permissions: AdminPermissions;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
