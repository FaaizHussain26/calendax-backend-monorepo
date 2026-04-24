import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FacebookWebhookService } from '../services/facebook-webhook.service';
import type { Response } from 'express';

@Controller('facebook/webhook')
export class FacebookWebhookController {
  private readonly logger = new Logger(FacebookWebhookController.name);

  constructor(
    private readonly webhookService: FacebookWebhookService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * GET /facebook/webhook
   * Facebook verification handshake — called once when you register
   * the webhook URL in the Facebook App Dashboard.
   * Must respond with hub.challenge if the verify token matches.
   */
  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ): void {
    const verifyToken = this.configService.get<string>('FACEBOOK_WEBHOOK_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Facebook webhook verified successfully.');
      res.status(HttpStatus.OK).send(challenge);
    } else {
      this.logger.warn('Facebook webhook verification failed — token mismatch.');
      res.status(HttpStatus.FORBIDDEN).send('Forbidden');
    }
  }

  /**
   * POST /facebook/webhook
   * Receives lead gen events from Facebook.
   * Facebook sends this when a user submits a connected form.
   * Must respond 200 immediately — process async.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async receive(@Body() body: any): Promise<void> {
    if (body?.object !== 'page') return;

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'leadgen') continue;

        const { leadgen_id, form_id, page_id } = change.value;
        this.webhookService
          .processLead({ leadgenId: leadgen_id, formId: form_id, pageId: page_id })
          .catch((err) =>
            this.logger.error(`Failed to process lead ${leadgen_id}`, err),
          );
      }
    }
  }
}
