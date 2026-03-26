import { BaseOrmEntity } from "../../utils/entities/base.orm-entity";
import {
  Entity,
  Column,
  PrimaryColumn,
  Unique,
} from "typeorm";

@Entity("protocols_sites")
@Unique(["protocol_id", "site_id"])
export class ProtocolsSites extends BaseOrmEntity {
  @PrimaryColumn()
  protocol_id: string;

  @PrimaryColumn()
  site_id: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  protocol_no: string;
}
