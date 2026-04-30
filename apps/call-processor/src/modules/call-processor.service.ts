import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
  Message,
} from '@aws-sdk/client-sqs';
import { TwilioService } from '@libs/twilio/twilio.service';
import { InternalApiClient } from '@libs/common/index';
import { LeadStatus } from '@libs/common/enums/lead.enum';

export interface CallJob {
  tenantId: string;
  leadId: string;
  callingConfigId: string;
  attemptNumber: number;
}

@Injectable()
export class CallProcessorService implements OnModuleInit {
  private readonly logger = new Logger(CallProcessorService.name);
  private readonly sqsClient: SQSClient;
  private readonly queuePrefix: string;
  private readonly accountId: string;
  private readonly region: string;
  private readonly webhookBaseUrl: string;
  private pollingTenants = new Set<string>();

  constructor(
    private readonly config: ConfigService,
    private readonly twilioService: TwilioService,
    private readonly internalApi: InternalApiClient,
  ) {
    this.region = this.config.get<string>('aws.region');
    this.accountId = this.config.get<string>('aws.accountId');
    this.queuePrefix = this.config.get<string>('aws.sqs.queuePrefix') ?? 'calling';
    this.webhookBaseUrl = this.config.get<string>('twilio.webhookUrl');

    this.sqsClient = new SQSClient({
      region: this.region,
      credentials: {
        accessKeyId: this.config.get<string>('aws.sqs.accessKeyId'),
        secretAccessKey: this.config.get<string>('aws.sqs.secretAccessKey'),
      },
    });

    this.logger.log(
      `CallProcessor init — region: ${this.region} · prefix: ${this.queuePrefix} · webhookUrl: ${this.webhookBaseUrl || 'MISSING'}`,
    );
  }

  async onModuleInit() {
    this.logger.log('Call processor started');
    await this.refreshTenantPolling();

    // Refresh tenant list every 5 minutes to pick up newly onboarded tenants
    setInterval(() => this.refreshTenantPolling(), 5 * 60 * 1000);
  }

  /**
   * Fetches active tenants from main API and starts polling
   * any new tenant queues not already being polled.
   * Safe to call repeatedly — won't start duplicate pollers.
   */
  private async refreshTenantPolling(): Promise<void> {
    try {
      const tenants = await this.internalApi.getActiveTenants();

      if (!tenants.length) {
        this.logger.warn('No active tenants found — not polling any queues');
        return;
      }

      for (const tenant of tenants) {
        if (!this.pollingTenants.has(tenant.id)) {
          this.pollingTenants.add(tenant.id);
          const queueUrl = this.buildQueueUrl(tenant.id);
          this.logger.log(`Starting poller for tenant: ${tenant.slug} → ${queueUrl}`);
          this.pollQueue(queueUrl, tenant.id);
        }
      }

      this.logger.log(`Polling ${this.pollingTenants.size} tenant queue(s)`);
    } catch (err) {
      this.logger.error('Failed to fetch active tenants — will retry in 5 minutes', err);
    }
  }

  private buildQueueUrl(tenantId: string): string {
    return `https://sqs.${this.region}.amazonaws.com/${this.accountId}/${this.queuePrefix}-${tenantId}.fifo`;
  }

  /**
   * Polls a single tenant queue continuously.
   * Each tenant runs its own independent async loop.
   */
  private async pollQueue(queueUrl: string, tenantId: string): Promise<void> {
    while (true) {
      try {
        const result = await this.sqsClient.send(
          new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 1,  // one call at a time per tenant
            WaitTimeSeconds: 20,     // long polling
          }),
        );

        for (const message of result.Messages ?? []) {
          await this.processMessage(queueUrl, message);
        }
      } catch (err) {
        this.logger.error(
          `Polling error for tenant ${tenantId} — retrying in 5s`,
          err,
        );
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  /**
   * Processes a single call job.
   * Handles all edge cases before dialing.
   */
  private async processMessage(queueUrl: string, message: Message): Promise<void> {
    // ── Parse job ─────────────────────────────────────────────────────
    let job: CallJob;
    try {
      job = JSON.parse(message.Body);
    } catch {
      this.logger.error(`Invalid message body — deleting: ${message.MessageId}`);
      await this.deleteMessage(queueUrl, message.ReceiptHandle);
      return;
    }

    const { tenantId, leadId, callingConfigId, attemptNumber } = job;
    this.logger.log(
      `Processing call job — lead: ${leadId} · attempt: ${attemptNumber}`,
    );

    // ── Edge case 1: Fetch lead ───────────────────────────────────────
    let lead: any;
    try {
      lead = await this.internalApi.getLeadById(leadId, tenantId);
    } catch {
      this.logger.warn(`Lead ${leadId} not found — deleting job`);
      await this.deleteMessage(queueUrl, message.ReceiptHandle);
      return;
    }

    if (!lead) {
      this.logger.warn(`Lead ${leadId} is null — deleting job`);
      await this.deleteMessage(queueUrl, message.ReceiptHandle);
      return;
    }

    // ── Edge case 2: Check lead status ────────────────────────────────
    if (lead.status === LeadStatus.CALLING) {
      this.logger.warn(
        `Lead ${leadId} already CALLING — extending visibility`,
      );
      await this.extendVisibility(queueUrl, message.ReceiptHandle, 3600);
      return;
    }

    if (
      [LeadStatus.SCREENED, LeadStatus.CONVERTED, LeadStatus.REJECTED].includes(
        lead.status,
      )
    ) {
      this.logger.log(
        `Lead ${leadId} in terminal state ${lead.status} — deleting job`,
      );
      await this.deleteMessage(queueUrl, message.ReceiptHandle);
      return;
    }

    // ── Edge case 3: Fetch calling config ─────────────────────────────
    let callingConfig: any;
    try {
      callingConfig = await this.internalApi.getCallingConfig(
        callingConfigId,
        tenantId,
      );
    } catch {
      this.logger.warn(`CallingConfig ${callingConfigId} not found — deleting job`);
      await this.deleteMessage(queueUrl, message.ReceiptHandle);
      return;
    }

    // ── Edge case 4: Check call time window ───────────────────────────
    if (!this.isWithinWindow(callingConfig.callTimeWindow)) {
      const secondsUntil = this.secondsUntilWindowOpen(callingConfig.callTimeWindow);
      this.logger.log(
        `Outside call window — extending visibility by ${secondsUntil}s`,
      );
      await this.extendVisibility(
        queueUrl,
        message.ReceiptHandle,
        Math.min(secondsUntil + 60, 43200),
      );
      return;
    }

    // ── Edge case 5: Check max retries ────────────────────────────────
    if (lead.callAttempts >= callingConfig.maxRetries) {
      this.logger.warn(
        `Lead ${leadId} hit max retries (${callingConfig.maxRetries}) — rejecting`,
      );
      await this.internalApi.updateLeadStatus(leadId, LeadStatus.REJECTED, tenantId);
      await this.deleteMessage(queueUrl, message.ReceiptHandle);
      return;
    }

    // ── Edge case 6: Fetch agent config ───────────────────────────────
    let agentConfig: any;
    try {
      agentConfig = await this.internalApi.getCurrentAgentConfig(tenantId);
    } catch {
      this.logger.error(
        `No agent config for tenant ${tenantId} — will retry on visibility timeout`,
      );
      return;
    }

    if (!agentConfig?.agentId) {
      this.logger.error(
        `AgentId missing for tenant ${tenantId} — will retry on visibility timeout`,
      );
      return;
    }

    // ── Edge case 7: Validate phone number ────────────────────────────
    if (!this.isValidPhone(lead.phone)) {
      this.logger.warn(
        `Invalid phone for lead ${leadId}: ${lead.phone} — rejecting`,
      );
      await this.internalApi.updateLeadStatus(leadId, LeadStatus.REJECTED, tenantId);
      await this.deleteMessage(queueUrl, message.ReceiptHandle);
      return;
    }

    // ── Step 8: Mark lead as calling ──────────────────────────────────
    await this.internalApi.updateLeadStatus(leadId, LeadStatus.CALLING, tenantId);
    this.logger.log(`Lead ${leadId} → CALLING`);

    // ── Step 9: Start heartbeat ───────────────────────────────────────
    const heartbeat = this.startHeartbeat(queueUrl, message.ReceiptHandle);

    // ── Step 10: Initiate call via Twilio ─────────────────────────────
    // Twilio connects the call to ElevenLabs agent automatically via the
    // agent URL. ElevenLabs AI handles the entire conversation.
    // Your code just hands off — Twilio + ElevenLabs take it from here.
    try {
      const callSid = await this.twilioService.initiateCall({
        to: lead.phone,
        agentId: agentConfig.agentId,
        callbackUrl: `${this.webhookBaseUrl}/twilio/status`,
      });

      this.logger.log(
        `Call initiated — SID: ${callSid} · lead: ${leadId} · agent: ${agentConfig.agentId}`,
      );

      // ── Step 11: Save CallSid for webhook handler to match later ──
      await this.internalApi.saveCallSid(leadId, callSid, tenantId);

      // ── Step 12: Clean up ─────────────────────────────────────────
      clearInterval(heartbeat);
      await this.deleteMessage(queueUrl, message.ReceiptHandle);

      this.logger.log(`Call job complete — lead: ${leadId}`);
    } catch (error) {
      clearInterval(heartbeat);
      this.logger.error(`Failed to initiate call for lead ${leadId}`, error);

      // revert lead status — allow retry on next visibility timeout
      await this.internalApi.updateLeadStatus(leadId, LeadStatus.PENDING, tenantId);
    }
  }

  /**
   * Resets visibility timeout every 10 minutes while call is active.
   * Prevents job reappearing during 30-40 min calls.
   */
  private startHeartbeat(
    queueUrl: string,
    receiptHandle: string,
  ): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        await this.extendVisibility(queueUrl, receiptHandle, 3600);
        this.logger.log('Heartbeat — visibility reset to 1hr');
      } catch (err) {
        this.logger.error('Heartbeat failed — job may reappear if call is long', err);
      }
    }, 10 * 60 * 1000);
  }

  private async extendVisibility(
    queueUrl: string,
    receiptHandle: string,
    seconds: number,
  ): Promise<void> {
    await this.sqsClient.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: seconds,
      }),
    );
  }

  private async deleteMessage(
    queueUrl: string,
    receiptHandle: string,
  ): Promise<void> {
    await this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  }

  private isWithinWindow(callTimeWindow: {
    startTime: string;
    endTime: string;
  }): boolean {
    const now = new Date();
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const [startH, startM] = callTimeWindow.startTime.split(':').map(Number);
    const [endH, endM] = callTimeWindow.endTime.split(':').map(Number);
    return (
      currentMinutes >= startH * 60 + startM &&
      currentMinutes <= endH * 60 + endM
    );
  }

  private secondsUntilWindowOpen(callTimeWindow: { startTime: string }): number {
    const now = new Date();
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const [startH, startM] = callTimeWindow.startTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    if (currentMinutes < startMinutes) {
      return (startMinutes - currentMinutes) * 60;
    }
    return (24 * 60 - currentMinutes + startMinutes) * 60;
  }

  private isValidPhone(phone: string): boolean {
    return /^\+[1-9]\d{6,14}$/.test(phone);
  }
}