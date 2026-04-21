import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AgentGender, AgentTone } from '../../../common/enums/agent.enum';

@Entity('agent_configs')
export class AgentConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AgentTone })
  tone: AgentTone;

  @Column({ type: 'enum', enum: AgentGender })
  gender: AgentGender;

  @Column({ type: 'text' })
  openingScript: string;

  @Column({ type: 'text' })
  endingScript: string;

  @Column({ default: true })
  isCurrent: boolean;

  @Column({ type: 'varchar', nullable: true, comment: 'ElevenLabs agent ID' })
  agentId: string | null;
  @Column({ type: 'varchar', nullable: true, comment: 'ElevenLabs voice ID' })
  voiceId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}