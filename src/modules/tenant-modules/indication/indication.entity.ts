import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProtocolEntity } from '../protocol/protocol.entity';
import { SiteEntity } from '../site/site.entity';

@Entity('indications')
export class IndicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => ProtocolEntity, (protocol) => protocol.indication)
  protocols: ProtocolEntity[];
  @OneToMany(() => SiteEntity, (site) => site.indication)
  sites: SiteEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
