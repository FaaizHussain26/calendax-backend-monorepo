import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentGender, AgentTone } from '../../common/enums/agent.enum';

export interface ElevenLabsAgentPayload {
  tone: AgentTone;
  gender: AgentGender;
  openingScript: string;
  endingScript: string;
}

@Injectable()
export class ElevenLabsService {
  private readonly logger = new Logger(ElevenLabsService.name);
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('elevenlabs.apiKey')!;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'xi-api-key': this.apiKey,
    };
  }

  /**
   * Maps our internal tone/gender to ElevenLabs voice settings.
   * Extend this mapping as you add more tones/genders.
   */
  private buildAgentBody(payload: ElevenLabsAgentPayload) {
    return {
      name: `agent-${payload.gender}-${payload.tone}`,
      conversation_config: {
        agent: {
          prompt: {
            prompt: `${payload.openingScript}\n\n${payload.endingScript}`,
          },
          first_message: payload.openingScript,
        },
        tts: {
          voice_id: this.resolveVoiceId(payload.tone, payload.gender),
        },
      },
    };
  }

  /**
   * Maps tone + gender to an ElevenLabs voice ID.
   * Replace these with your actual voice IDs from the ElevenLabs dashboard.
   */
  private resolveVoiceId(tone: AgentTone, gender: AgentGender): string {
    const voiceMap: Record<string, string> = {
      [`${AgentGender.MALE}_${AgentTone.PROFESSIONAL}`]: 'L0Dsvb3SLTyegXwtm47J', // 'voice_id_male_professional',
      [`${AgentGender.MALE}_${AgentTone.FRIENDLY}`]: 'pqHfZKP75CvOlQylNhV4', // 'voice_id_male_friendly',
      [`${AgentGender.FEMALE}_${AgentTone.PROFESSIONAL}`]: '0fbdXLXuDBZXm2IHek4L', //'voice_id_female_professional',
      [`${AgentGender.FEMALE}_${AgentTone.FRIENDLY}`]: 'Xb7hH8MSUJpSbSDYk0k2',
    };
    return voiceMap[`${gender}_${tone}`] ?? 'voice_id_default';
  }
async getVoiceId(tone: AgentTone, gender: AgentGender): Promise<string> {
    return this.resolveVoiceId(tone, gender);
  }


  async createAgent(payload: ElevenLabsAgentPayload): Promise<string> {
    try {
      const res = await fetch(`${this.baseUrl}/convai/agents/create`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(this.buildAgentBody(payload)),
      });
      const data = await res.json();
      console.log('data of res:', data);
      if (!res.ok) throw new Error(data?.detail ?? 'ElevenLabs create failed');
      this.logger.log(`ElevenLabs agent created: ${data.agent_id}`);
      return data.agent_id;
    } catch (error) {
      this.logger.error('Failed to create ElevenLabs agent', error);
      throw new InternalServerErrorException('Failed to create agent on ElevenLabs.');
    }
  }

  async updateAgent(agentId: string, payload: ElevenLabsAgentPayload): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/convai/agents/${agentId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(this.buildAgentBody(payload)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail ?? 'ElevenLabs update failed');
      this.logger.log(`ElevenLabs agent updated: ${agentId}`);
    } catch (error) {
      this.logger.error(`Failed to update ElevenLabs agent ${agentId}`, error);
      throw new InternalServerErrorException('Failed to update agent on ElevenLabs.');
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/convai/agents/${agentId}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail ?? 'ElevenLabs delete failed');
      }
      this.logger.log(`ElevenLabs agent deleted: ${agentId}`);
    } catch (error) {
      this.logger.error(`Failed to delete ElevenLabs agent ${agentId}`, error);
      throw new InternalServerErrorException('Failed to delete agent on ElevenLabs.');
    }
  }
}
