import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AdminEntity } from "../admin/entities/admin.entity";

@Entity("tenant")
export class TenantEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text'})
    name: string;

    @Column({ type: 'text', unique: true })
    slug: string;

    @ManyToOne(() => AdminEntity, (admin) => admin.id, {
        onDelete: 'CASCADE'
    })    
    createdById: AdminEntity;

    @ManyToOne(() => AdminEntity, (admin) => admin.id, {
        onDelete: 'CASCADE'
    })
    updatedById: AdminEntity;

    @CreateDateColumn()
    createdAt: Date;
    
    @CreateDateColumn()
    updatedAt: Date;
}