import { InternalApiKeyGuard } from '@libs/common/guards/internal-api.guard';
import { TenantGuard } from '@libs/common/index';
import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadEntity } from './lead.entity';

class UpdateStatusDto {
  status: string;
}

class SaveTranscriptDto {
  transcript: string;
}

@Controller('internal/leads')
@UseGuards(InternalApiKeyGuard, TenantGuard)
export class InternalLeadController {
  constructor(private readonly leadService: LeadService) {}

  /**
   * GET /internal/leads/pending
   * Used by scheduler to fetch pending leads for a calling config.
   */
  @Get('pending')
  async getPending(
    @Query('callingConfigId') callingConfigId: string,
    @Query('limit') limit: string,
  ): Promise<LeadEntity[]> {
    if (!callingConfigId) throw new BadRequestException('callingConfigId is required.');

    return this.leadService.findPendingByCallingConfig(callingConfigId, parseInt(limit) || 10);
  }

  /**
   * PATCH /internal/leads/:id/status
   * Used by call processor + webhook handler to update call state.
   */
  @Patch(':id/status')
  async updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto): Promise<LeadEntity> {
    return this.leadService.updateStatus(id, { status: dto.status as any });
  }

  /**
   * PATCH /internal/leads/:id/transcript
   * Used by webhook handler to save call transcript.
   */
  @Patch(':id/transcript')
  async saveTranscript(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SaveTranscriptDto) {
    await this.leadService.findById(id);
    return this.leadService.addTranscript(id, { transcript: dto.transcript });
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadService.findById(id);
  }

  @Patch(':id/call-sid')
  async saveCallSid(@Param('id', ParseUUIDPipe) id: string, @Body() body: { callSid: string }) {
    return this.leadService.update(id, { callSid: body.callSid } as any);
  }
}
