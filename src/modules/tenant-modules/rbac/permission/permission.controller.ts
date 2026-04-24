// src/modules/tenant-modules/rbac/permission/permission.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from '../../../../services/jwt/jwt.provider';
import { TenantGuard } from '@libs/common/guards/tenant.guard';
import { CreatePermissionDto, UpdatePermissionDto } from '@libs/common/dto/permission.dto';
import { PermissionsGuard } from '@libs/common/guards/permission.guard';
import { PaginationDto } from '@libs/common/dto/pagination.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: string) {
    return this.service.findByGroup(groupId);
  }

  @Post('group/:groupId')
  create(@Param('groupId') groupId: string, @Body() dto: CreatePermissionDto) {
    return this.service.create(groupId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
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
