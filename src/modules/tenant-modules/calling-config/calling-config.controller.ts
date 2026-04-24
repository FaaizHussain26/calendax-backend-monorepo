import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, Request, UseGuards } from '@nestjs/common';
import { CallingConfigService } from './calling-config.service';
import { CreateCallingConfigDto, UpdateCallingConfigDto } from './calling-config.dto';
import { CallingConfigEntity } from './calling-config.entity';
import type { TenantRequest } from '@libs/common/interfaces/request.interface';
import { JwtAuthGuard } from 'src/services/jwt/jwt.provider';
import { PermissionsGuard, TenantGuard } from '@libs/common/index';
@UseGuards(JwtAuthGuard,TenantGuard,PermissionsGuard)
@Controller('calling-config')
export class CallingConfigController {
  constructor(private readonly service: CallingConfigService) {}

  @Get()
  getAll(): Promise<CallingConfigEntity[]> {
    return this.service.getAll();
  }

  @Get('protocol/:protocolId')
  getByProtocol(@Param('protocolId', ParseUUIDPipe) protocolId: string): Promise<CallingConfigEntity[]> {
    return this.service.getByProtocol(protocolId);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<CallingConfigEntity> {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreateCallingConfigDto, @Request() req: TenantRequest): Promise<CallingConfigEntity> {
    return this.service.create(dto, req.tenantId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCallingConfigDto, @Request() req: TenantRequest): Promise<CallingConfigEntity> {
    return this.service.update(id, dto, req.tenantId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: TenantRequest): Promise<{ message: string }> {
    return this.service.remove(id, req.tenantId);
  }
}
