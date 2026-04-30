import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio, validateRequest } from 'twilio';
export interface InitiateCallParams {
  to: string;
  agentId: string;
  callbackUrl: string;
}
@Injectable()
export class TwilioService {
  private readonly client: Twilio;
  private readonly from: string;
  private readonly logger = new Logger(TwilioService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Twilio(
      this.configService.get<string>('twilio.sid'),
      this.configService.get<string>('twilio.authToken'),
    );
    this.from = this.configService.get<string>('twilio.phoneNumber');
  }

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

  validateWebhookSignature(
    url: string,
    params: Record<string, string>,
    signature: string,
  ): boolean {
    return validateRequest(
      this.configService.get<string>('twilio.authToken'),
      signature,
      url,
      params,
    );
  }
}