import { Column, CreateDateColumn, DeleteDateColumn, Entity, Timestamp, UpdateDateColumn } from "typeorm";
import { BaseOrmEntity } from "../../utils/entities/base.orm-entity";
import { Exclude } from "class-transformer";

@Entity('leads_platform')
export class LeadsPlatform extends BaseOrmEntity {
    @Column({ nullable: false })
    platform: string;

    @Column({ nullable: false })
    link: string;

    @Column({ nullable: true })
    pageId?: string;

    @Column({ nullable: true })
    formId?: string;

    @Column({ nullable: true })
    pageName?: string;

    @CreateDateColumn({ name: 'created_at' })
    @Exclude()
    public override createdAt?: Timestamp;

    @UpdateDateColumn({ name: 'updated_at' })
    @Exclude()
    public override updatedAt?: Timestamp;

    @DeleteDateColumn({ name: 'deleted_at' })
    @Exclude()
    public override deletedAt?: Timestamp;
}