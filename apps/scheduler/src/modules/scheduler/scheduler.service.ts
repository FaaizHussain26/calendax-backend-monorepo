import { Injectable, Logger } from '@nestjs/common';
import { AwsSqsService, CallJob } from '@libs/aws/aws-sqs.service';
import { DayOfWeek, InternalApiClient } from '@libs/common/index';

export interface SchedulerEvent {
  tenantId: string;
  callingConfigId: string;
}

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly internalApi: InternalApiClient,
    private readonly sqsService: AwsSqsService,
  ) {}

  async handleSchedulerEvent(event: SchedulerEvent): Promise<void> {
    const { tenantId, callingConfigId } = event;
    this.logger.log(
      `Scheduler fired — tenantId: ${tenantId} · configId: ${callingConfigId}`,
    );

    // ── Step 1: Load CallingConfig from main API ──────────────────────
    const callingConfig:any = await this.internalApi.getCallingConfig(
      callingConfigId,
      tenantId,
    );

    if (!callingConfig) {
      this.logger.warn(`CallingConfig ${callingConfigId} not found — skipping`);
      return;
    }

    // ── Step 2: Check selectedDays ────────────────────────────────────
    if (!this.isTodaySelected(callingConfig.selectedDays)) {
      this.logger.log(
        `Today is not a calling day for config ${callingConfigId} — skipping`,
      );
      return;
    }

    // ── Step 3: Check callTimeWindow ──────────────────────────────────
    if (!this.isWithinWindow(callingConfig.callTimeWindow)) {
      this.logger.log(
        `Outside call window for config ${callingConfigId} — skipping`,
      );
      return;
    }

    // ── Step 4: Fetch pending leads from main API ─────────────────────
    const leads:any = await this.internalApi.getPendingLeads(
      callingConfigId,
      callingConfig.numOfCalls,
      tenantId,
    );

    if (!leads.length) {
      this.logger.log(
        `No pending leads for config ${callingConfigId} — skipping`,
      );
      return;
    }

    this.logger.log(
      `Enqueuing ${leads.length} leads for config ${callingConfigId}`,
    );

    // ── Step 5: Enqueue each lead as a CallJob onto SQS ───────────────
    for (const lead of leads) {
      /// add lead checks here
      // also add allow repeatative lead check  
      const job: CallJob = {
        tenantId,
        leadId: lead.id,
        callingConfigId,
        agentId: '',      // loaded by call processor from AgentConfig
        attemptNumber: lead.callAttempts + 1,
      };

      await this.sqsService.enqueue(job, 0);
      this.logger.log(`Enqueued lead ${lead.id} · attempt ${job.attemptNumber}`);
    }

    this.logger.log(
      `Scheduler complete — ${leads.length} jobs enqueued for tenant ${tenantId}`,
    );
  }

  /**
   * Checks if today's day of week is in the tenant's selectedDays.
   * Uses UTC — timezone support to be added in future iteration.
   */
  private isTodaySelected(selectedDays: string[]): boolean {
    const days = Object.values(DayOfWeek);
    const today = days[new Date().getUTCDay()];
    return selectedDays.map((d) => d.toLowerCase()).includes(today);
  }

  /**
   * Checks if current UTC time is within callTimeWindow.
   * startTime and endTime format: "HH:MM" (24hr).
   */
  private isWithinWindow(
    callTimeWindow: { startTime: string; endTime: string },
  ): boolean {
    const now = new Date();
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const [startH, startM] = callTimeWindow.startTime.split(':').map(Number);
    const [endH, endM] = callTimeWindow.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
}