import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { LeadService, BulkCreateResult, PaginatedLeads } from './lead.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  UpdateLeadStatusDto,
  BulkCreateLeadDto,
  LeadQueryDto,
} from './lead.dto';
import { LeadEntity } from './lead.entity';

@Controller('leads')
export class LeadController {
  constructor(private readonly service: LeadService) {}

  @Get()
  findAll(@Query() query: LeadQueryDto): Promise<PaginatedLeads> {
    return this.service.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<LeadEntity> {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateLeadDto): Promise<LeadEntity> {
    return this.service.create(dto);
  }

  @Post('bulk')
  bulkCreate(@Body() dto: BulkCreateLeadDto): Promise<BulkCreateResult> {
    return this.service.bulkCreate(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ): Promise<LeadEntity> {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadStatusDto,
  ): Promise<LeadEntity> {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.service.remove(id);
  }
}
