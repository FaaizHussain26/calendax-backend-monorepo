import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaginationDto } from '@libs/common/dto/pagination.dto';
import { IndicationService } from './indication.service';
import { CreateIndicationDto, UpdateIndicationDto } from './indication.dto';
import { PermissionsGuard } from '@libs/common/guards/permission.guard';
import { TenantGuard } from '@libs/common/guards/tenant.guard';
import { JwtAuthGuard } from '../../../services/jwt/jwt.provider';
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)

@Controller('indication')
export class IndicationController {
  constructor(private readonly service: IndicationService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateIndicationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIndicationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
