// src/modules/tenant-modules/rbac/permission-group/permission-group.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PermissionGroupService } from './permission-group.service';
import { JwtAuthGuard } from '../../../../common/jwt/jwt.provider';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../../../common/guards/permission.guard';
import { CreatePermissionGroupDto, UpdatePermissionGroupDto } from '../../../../common/dto/permission.dto';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

@Controller('permission-groups')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PermissionGroupController {
  constructor(private readonly service: PermissionGroupService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePermissionGroupDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionGroupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }
}
