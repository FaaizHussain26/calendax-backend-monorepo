import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { TwilioService } from '@libs/twilio/twilio.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly twilioService: TwilioService,
  ) {}

  /**
   * POST /webhook/twilio/status
   * Receives Twilio call status callbacks.
   *
   * Possible statuses: initiated, ringing, answered, completed,
   * busy, no-answer, canceled, failed
   */
  @Post('twilio/status')
  @HttpCode(HttpStatus.OK)
  async handleStatus(
    @Body() body: Record<string, string>,
    @Headers('x-twilio-signature') signature: string,
  ): Promise<void> {
    await this.webhookService.handleCallStatus(body);
  }
}
