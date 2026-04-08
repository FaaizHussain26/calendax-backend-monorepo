import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { IndicationEntity } from '../indication/indication.entity';
import { SiteEntity } from '../site/site.entity';
@Entity('protocols')
export class ProtocolEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false, unique: true })
  protocolNumber: string;

  @Column({ nullable: true })
  indicationId: string;
  @ManyToOne(() => IndicationEntity, (indication) => indication.protocols)
  indication: IndicationEntity;

  @ManyToMany(() => SiteEntity, (site) => site.protocols)
  @JoinTable({
    name: 'site_protocols',
    joinColumn: { name: 'protocolId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'siteId', referencedColumnName: 'id' },
  })
  sites: SiteEntity[];

  @CreateDateColumn({})
  @Exclude()
  public createdAt: Date;

  @UpdateDateColumn({})
  @Exclude()
  public updatedAt: Date;

  @DeleteDateColumn({})
  @Exclude()
  public deletedAt: Date;
}
