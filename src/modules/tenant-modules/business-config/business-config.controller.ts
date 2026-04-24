import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { BusinessConfigService } from './business-config.service';
import { CreateBusinessConfigDto, UpdateBusinessConfigDto } from './business-config.dto';
import { BusinessConfigEntity } from './business-config.entity';
import { PermissionsGuard, TenantGuard } from '@libs/common/index';
import { JwtAuthGuard } from 'src/services/jwt/jwt.provider';
@UseGuards(JwtAuthGuard,TenantGuard,PermissionsGuard)

@Controller('business-config')
export class BusinessConfigController {
  constructor(private readonly service: BusinessConfigService) {}

  @Get()
  get(): Promise<BusinessConfigEntity> {
    return this.service.get();
  }

  @Put()
  upsert(@Body() dto: CreateBusinessConfigDto): Promise<BusinessConfigEntity> {
    return this.service.upsert(dto);
  }

  @Delete()
  remove(): Promise<{ message: string }> {
    return this.service.remove();
  }
}