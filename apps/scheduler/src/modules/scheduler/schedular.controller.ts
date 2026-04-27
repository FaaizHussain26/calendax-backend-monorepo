import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SchedulerService, SchedulerEvent } from './scheduler.service';
import { InternalApiKeyGuard } from '@libs/common/guards/internal-api.guard';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly service: SchedulerService) {}

  /**
   * POST /scheduler/trigger
   * Called by EventBridge in production (via ECS task input).
   * Called directly for local development and testing.
   * Protected by internal API key.
   */
  @Post('trigger')
  @UseGuards(InternalApiKeyGuard)
  trigger(@Body() event: SchedulerEvent): Promise<void> {
    return this.service.handleSchedulerEvent(event);
  }
}
