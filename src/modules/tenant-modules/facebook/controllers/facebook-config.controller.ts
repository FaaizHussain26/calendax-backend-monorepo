import { Controller, Get, Put, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { FacebookConfigService } from '../services/facebook-config.service';
import { CreateFacebookConfigDto } from '../dto/facebook-config.dto';
import { FacebookConfigEntity } from '../entities/facebook-config.entity';
import { PermissionsGuard, TenantGuard } from '@libs/common/index';
import { JwtAuthGuard } from 'src/services/jwt/jwt.provider';
@UseGuards(JwtAuthGuard,TenantGuard,PermissionsGuard)

@Controller('facebook/config')
export class FacebookConfigController {
  constructor(private readonly service: FacebookConfigService) {}

  @Get()
  get(): Promise<FacebookConfigEntity> {
    return this.service.get();
  }

  @Put()
  upsert(@Body() dto: CreateFacebookConfigDto): Promise<FacebookConfigEntity> {
    return this.service.upsert(dto);
  }

  @Patch('disconnect')
  disconnect(): Promise<{ message: string }> {
    return this.service.disconnect();
  }

  @Delete()
  remove(): Promise<{ message: string }> {
    return this.service.remove();
  }
}