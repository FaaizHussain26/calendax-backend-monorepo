import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsService } from '@libs/elevenlabs/elevenlabs.service';
import { TwilioService } from '@libs/twilio/twilio.service';
import { AwsSqsService, CallJob } from '@libs/aws/aws-sqs.service';

@Injectable()
export class CallProcessorService {
  private readonly logger = new Logger(CallProcessorService.name);

  constructor(
    private readonly elevenLabs: ElevenLabsService,
    private readonly twilio: TwilioService,
    private readonly sqs: AwsSqsService,
  ) {}

  /**
   * Pulls jobs from tenant SQS queue and processes each call.
   *
   * Flow per job:
   * 1. Load lead + callingConfig from tenant DB
   * 2. Load agentConfig (gets agentId for ElevenLabs)
   * 3. Check callTimeWindow — if outside window re-enqueue with delay
   * 4. Initiate call via Twilio → state = 'calling'
   * 5. Update lead: callAttempts++, lastCalledAt, status = 'calling'
   * 6. Twilio webhook handler takes over from here
   */
  async processJob(job: CallJob): Promise<void> {
    this.logger.log(
      `Processing call job — leadId: ${job.leadId} · attempt: ${job.attemptNumber}`,
    );
  }
}
