// site.entity.ts - cleaned up
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
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserEntity } from '../user/user.entity';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false })
  prefix: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, name: 'site_number' })
  siteNumber: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true, name: 'street_address' })
  streetAddress: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true, name: 'zip_code' })
  zipCode: string;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  indication: string;

  @ManyToMany(() => UserEntity, (user) => user.assignedSites)
  @JoinTable({
    name: 'site_users',
    joinColumn: { name: 'siteId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  siteUsers: UserEntity[];

  //   @OneToMany(() => PatientSite, (ps) => ps.site)
  //   patientSites: PatientSite[];

  @CreateDateColumn({ name: 'created_at' })
  @Exclude()
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Exclude()
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude()
  public deletedAt: Date;
}
