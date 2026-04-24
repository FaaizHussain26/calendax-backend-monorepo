import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DayOfWeek } from '@libs/common/enums/tenant.enum';

export class CallTimeWindow {
  startTime: string;
  endTime: string;
}

@Entity('calling_configs')
export class CallingConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  protocolId: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'jsonb' })
  callTimeWindow: CallTimeWindow;

  @Column({ type: 'simple-array' })
  selectedDays: DayOfWeek[];

  @Column({ type: 'int' })
  numOfCalls: number;

  @Column({ type: 'int' })
  maxRetries: number;

  @Column({ type: 'int', comment: 'Delay between retries in minutes' })
  callDelay: number;

  @Column({ type: 'varchar', nullable: true, comment: 'EventBridge schedule rule name' })
  scheduleRuleName: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}