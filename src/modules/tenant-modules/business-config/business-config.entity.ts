import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export class WorkingHours {
  startTime: string;
  endTime: string;
}

@Entity('business_configs')
export class BusinessConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({  })
  companyName: string;

  @Column({  unique: true })
  companyEmail: string;

  @Column({ type: 'jsonb' })
  workingHours: WorkingHours;

  @Column({})
  workingDays: string[];

  @Column()
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
