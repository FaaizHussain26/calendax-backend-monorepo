
import { Exclude } from "class-transformer";
import {
    BaseEntity,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    Timestamp,
    UpdateDateColumn
} from "typeorm";

export class BaseV2OrmEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @CreateDateColumn({ name: "created_at" })
    @Exclude()
    public createdAt: Timestamp;

    @UpdateDateColumn({ name: "updated_at" })
    @Exclude()
    public updatedAt: Timestamp;

    @DeleteDateColumn({ name: "deleted_at" })
    @Exclude()
    public deletedAt: Timestamp;
}
