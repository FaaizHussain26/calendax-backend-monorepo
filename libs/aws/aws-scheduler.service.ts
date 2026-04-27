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
import { DayOfWeek } from '@libs/common/enums/tenant.enum';

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
  const region = this.configService.get<string>('aws.region');
  const accessKeyId = this.configService.get<string>('aws.schedular.accessKeyId');
  const secretAccessKey = this.configService.get<string>('aws.schedular.secretAccessKey');
  const targetArn = this.configService.get<string>('aws.schedular.schedulerServiceArn');
  const roleArn = this.configService.get<string>('aws.schedular.eventbridgeRoleArn');

  this.logger.log(`EventBridge Scheduler init — region: ${region} · keyId: ${accessKeyId ? 'SET' : 'MISSING'} · secret: ${secretAccessKey ? 'SET' : 'MISSING'} · targetArn: ${targetArn || 'MISSING'} · roleArn: ${roleArn || 'MISSING'}`);

  if (!region || !accessKeyId || !secretAccessKey || !targetArn || !roleArn) {
    this.logger.error('EventBridge credentials incomplete — check aws.schedular config in .env');
  }

  this.client = new SchedulerClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  this.targetArn = targetArn;
  this.roleArn = roleArn;
}

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
  // Use first 8 chars of each UUID to keep under 64 char limit
  const shortTenant = tenantId.replace(/-/g, '').slice(0, 8);
  const shortConfig = callingConfigId.replace(/-/g, '').slice(0, 8);
  return `t${shortTenant}-c${shortConfig}`;
  // example: td9e4a0df-c2bdadee2 = 19 chars
}

private buildScheduleInput(
  name: string,
  selectedDays: DayOfWeek[],
  startTime: string,
  payload: SchedulePayload,
): CreateScheduleCommandInput {
  return {
    Name: name,
    GroupName:"default",
    ScheduleExpression: this.buildCronExpression(selectedDays, startTime),
    ScheduleExpressionTimezone: 'UTC',
    FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
    Target: {
      Arn: this.targetArn,
      RoleArn: this.roleArn,
      SqsParameters: {
        MessageGroupId: name,
      },
      Input: JSON.stringify(payload),
    },
  };
}
  async createSchedule(
    tenantId: string,
    callingConfigId: string,
    selectedDays: DayOfWeek[],
    startTime: string,
  ): Promise<string> {
    const name = this.buildRuleName(tenantId, callingConfigId);
    const input = this.buildScheduleInput(name, selectedDays, startTime, {
      tenantId,
      callingConfigId,
    });

    try {
      await this.client.send(new CreateScheduleCommand(input));
      this.logger.log(`Created EventBridge schedule: ${name}`);
      return name;
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
