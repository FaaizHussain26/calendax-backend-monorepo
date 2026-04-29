import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AgentConfigService } from './agent-config.service';
import { CreateAgentConfigDto, UpdateAgentConfigDto } from './agent-config.dto';
import { AgentConfigEntity } from './agent-config.entity';

@Controller('agent-config')
export class AgentConfigController {
  constructor(private readonly service: AgentConfigService) {}

  @Get()
  findAll(): Promise<AgentConfigEntity[]> {
    return this.service.findAll();
  }

  @Get('current')
  findCurrent(): Promise<AgentConfigEntity | null> {
    return this.service.findCurrent();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AgentConfigEntity> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAgentConfigDto): Promise<AgentConfigEntity> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAgentConfigDto,
  ): Promise<AgentConfigEntity> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.service.remove(id);
  }
}