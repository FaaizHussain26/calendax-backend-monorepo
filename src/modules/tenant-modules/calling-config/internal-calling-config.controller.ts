import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { CallingConfigService } from '../calling-config/calling-config.service';
import { CallingConfigEntity } from '../calling-config/calling-config.entity';
import { TenantGuard, TenantRequest } from '@libs/common/index';
import { InternalApiKeyGuard } from '@libs/common/guards/internal-api.guard';

@Controller('internal/calling-configs')
@UseGuards(InternalApiKeyGuard,TenantGuard)
export class InternalCallingConfigController {
  constructor(private readonly service: CallingConfigService) {}

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string, @Req() req:TenantRequest  ): Promise<CallingConfigEntity> {
    return this.service.getById(id);
  }
}   