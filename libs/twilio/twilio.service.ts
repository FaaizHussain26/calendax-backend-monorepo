import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

export interface InitiateCallParams {
  to: string;
  agentId: string;
  callbackUrl: string;
}

@Injectable()
export class TwilioService {
  private readonly client: twilio.Twilio;
  private readonly from: string;
  private readonly logger = new Logger(TwilioService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
    this.from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
  }

  /**
   * Initiates an outbound call via Twilio.
   * Points to ElevenLabs Conversational AI as the call handler.
   * statusCallback receives answered / no-answer / failed / completed events.
   */
  async initiateCall(params: InitiateCallParams): Promise<string> {
    try {
      const call = await this.client.calls.create({
        to: params.to,
        from: this.from,
        url: `https://api.elevenlabs.io/v1/convai/twilio/inbound_webrtc?agent_id=${params.agentId}`,
        statusCallback: params.callbackUrl,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        machineDetection: 'Enable',
      });
      this.logger.log(`Call initiated — SID: ${call.sid} · to: ${params.to}`);
      return call.sid;
    } catch (error) {
      this.logger.error(`Failed to initiate call to ${params.to}`, error);
      throw error;
    }
  }

  /**
   * Validates that an incoming webhook POST is genuinely from Twilio.
   * Call this before processing any Twilio webhook payload.
   */
  validateWebhookSignature(
    url: string,
    params: Record<string, string>,
    signature: string,
  ): boolean {
    return twilio.validateRequest(
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
      signature,
      url,
      params,
    );
  }
}
