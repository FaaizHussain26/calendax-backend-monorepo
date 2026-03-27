import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { AdminEntity } from "./admin.entity";
import { AdminPage } from "src/utils/enums/admin.enum";
@Entity("admin_permissions")
@Unique(['admin', 'page'])
export class AdminPermissions {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => AdminEntity, (admin) => admin.permissions, {
        onDelete: 'CASCADE'
    })    
    admin: AdminEntity;

    @Column({
        type: 'enum',
        enum: AdminPage
    })
    page: AdminPage;

    @Column({ type: 'boolean' })
    read: boolean;

    @Column({ type: 'boolean' })
    write: boolean;
}