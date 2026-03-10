import { Entity, PrimaryColumn, Unique } from "typeorm";
import { BaseOrmEntity } from "../../utils/entities/base.orm-entity";

@Entity("protocol_sites")
@Unique(["protocol_id", "site_id"])
export class ProtocolsSites extends BaseOrmEntity {
    @PrimaryColumn()
    protocol_id: string;

    @PrimaryColumn()
    site_id: string;
}