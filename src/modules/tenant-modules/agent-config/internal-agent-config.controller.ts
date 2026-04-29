import { InternalApiKeyGuard } from '@libs/common/guards/internal-api.guard';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AgentConfigService } from './agent-config.service';
import { TenantGuard } from '@libs/common/index';
@Controller('internal/agent-config')
@UseGuards(InternalApiKeyGuard,TenantGuard)
export class InternalAgentConfigController {
  constructor(private readonly service: AgentConfigService) {}

  @Get('current')
  getCurrent() {
    return this.service.findCurrent();
  }
}