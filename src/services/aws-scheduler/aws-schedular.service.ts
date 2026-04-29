import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SchedulerClient,
  CreateScheduleCommand,
  UpdateScheduleCommand,
  DeleteScheduleCommand,
  FlexibleTimeWindowMode,
  CreateScheduleCommandInput,
} from '@aws-sdk/client-scheduler';
import { DayOfWeek } from '../../common/enums/tenant.enum';

export interface SchedulePayload {
  tenantId: string;
  callingConfigId: string;
}

@Injectable()
export class AwsSchedulerService {
  private readonly client: SchedulerClient;
  private readonly targetArn: string;
  private readonly roleArn: string;
  private readonly logger = new Logger(AwsSchedulerService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new SchedulerClient({
      region: this.configService.get<string>('aws.region')!,
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId')!,
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey')!,
      },
    });
    this.targetArn = this.configService.get<string>('aws.schedulerServiceArn')!;
    this.roleArn = this.configService.get<string>('aws.eventbridgeRoleArn')!;
  }

  /**
   * Builds a cron expression from selectedDays + startTime.
   * startTime format: "HH:MM" (24hr, tenant timezone handled upstream)
   * selectedDays: DayOfWeek[] e.g. ['monday', 'wednesday']
   *
   * EventBridge cron: cron(minutes hours day-of-month month day-of-week year)
   * Day-of-week: SUN=1, MON=2, TUE=3, WED=4, THU=5, FRI=6, SAT=7
   */
  private buildCronExpression(selectedDays: DayOfWeek[], startTime: string): string {
    const dayMap: Record<DayOfWeek, number> = {
      [DayOfWeek.SUNDAY]: 1,
      [DayOfWeek.MONDAY]: 2,
      [DayOfWeek.TUESDAY]: 3,
      [DayOfWeek.WEDNESDAY]: 4,
      [DayOfWeek.THURSDAY]: 5,
      [DayOfWeek.FRIDAY]: 6,
      [DayOfWeek.SATURDAY]: 7,
    };

    const [hour, minute] = startTime.split(':');
    const days = selectedDays.map((d) => dayMap[d]).join(',');

    return `cron(${minute} ${hour} ? * ${days} *)`;
  }

  /**
   * Rule name is scoped per tenant + config so each CallingConfig
   * gets its own independent EventBridge rule.
   */
  private buildRuleName(tenantId: string, callingConfigId: string): string {
    return `tenant-${tenantId}-config-${callingConfigId}`;
  }

  private buildScheduleInput(
    name: string,
    selectedDays: DayOfWeek[],
    startTime: string,
    payload: SchedulePayload,
  ): CreateScheduleCommandInput {
    return {
      Name: name,
      ScheduleExpression: this.buildCronExpression(selectedDays, startTime),
      FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
      Target: {
        Arn: this.targetArn,
        RoleArn: this.roleArn,
        Input: JSON.stringify(payload),
      },
    };
  }

  async createSchedule(
    tenantId: string,
    callingConfigId: string,
    selectedDays: DayOfWeek[],
    startTime: string,
  ): Promise<void> {
    const name = this.buildRuleName(tenantId, callingConfigId);
    const input = this.buildScheduleInput(name, selectedDays, startTime, {
      tenantId,
      callingConfigId,
    });

    try {
      await this.client.send(new CreateScheduleCommand(input));
      this.logger.log(`Created EventBridge schedule: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to create schedule ${name}`, error);
      throw error;
    }
  }

  async updateSchedule(
    tenantId: string,
    callingConfigId: string,
    selectedDays: DayOfWeek[],
    startTime: string,
  ): Promise<void> {
    const name = this.buildRuleName(tenantId, callingConfigId);
    const input = this.buildScheduleInput(name, selectedDays, startTime, {
      tenantId,
      callingConfigId,
    });

    try {
      await this.client.send(new UpdateScheduleCommand(input));
      this.logger.log(`Updated EventBridge schedule: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to update schedule ${name}`, error);
      throw error;
    }
  }

  async deleteSchedule(tenantId: string, callingConfigId: string): Promise<void> {
    const name = this.buildRuleName(tenantId, callingConfigId);
    try {
      await this.client.send(new DeleteScheduleCommand({ Name: name }));
      this.logger.log(`Deleted EventBridge schedule: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to delete schedule ${name}`, error);
      throw error;
    }
  }
}