import { Injectable, Logger } from '@nestjs/common';
import { AwsSqsService, CallJob } from '@libs/aws/aws-sqs.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly sqs: AwsSqsService) {}

  /**
   * Handles Twilio call status updates.
   *
   * Flow:
   * completed  → save transcript → lead.status = 'screened'
   * no-answer  → check attempts vs maxRetries
   *              under limit → re-enqueue with callDelay
   *              at limit    → lead.status = 'rejected' → DLQ
   * failed     → same as no-answer
   * busy       → same as no-answer
   */
  async handleCallStatus(body: Record<string, string>): Promise<void> {
    const { CallSid, CallStatus } = body;
    this.logger.log(`Twilio status: ${CallStatus} · CallSid: ${CallSid}`);
  }
}
