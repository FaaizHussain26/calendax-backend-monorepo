// src/modules/tenant-modules/rbac/permission-group/permission-group.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PermissionGroupService } from './permission-group.service';
import { JwtAuthGuard } from '../../../../services/jwt/jwt.provider';
import { TenantGuard } from '@libs/common/guards/tenant.guard';
import { PermissionsGuard } from '@libs/common/guards/permission.guard';
import { CreatePermissionGroupDto, UpdatePermissionGroupDto } from '@libs/common/dto/permission.dto';
import { PaginationDto } from '@libs/common/dto/pagination.dto';
import type { RequestWithUser } from '@libs/common/interfaces/request.interface';

@Controller('permission-groups')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PermissionGroupController {
  constructor(private readonly service: PermissionGroupService) {}

  @Get()
  findAll(@Query() query: PaginationDto, @Req() req: RequestWithUser) {
    return this.service.findAll(query);
  }

  @Get('/sidebar')
  findAllPermissionGroupForSidebar(@Req() req: RequestWithUser) {
    return this.service.getMyPermissionsGroup(req.user);
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
