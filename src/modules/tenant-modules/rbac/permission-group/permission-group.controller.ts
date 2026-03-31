// src/modules/tenant-modules/rbac/permission-group/permission-group.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PermissionGroupService } from './permission-group.service';
import {
  CreatePermissionGroupDto,
  UpdatePermissionGroupDto,
} from './permission-group.dto';
import { JwtAuthGuard } from '../../../../common/jwt/jwt.provider';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../../../common/guards/permission.guard';

@Controller('rbac/permission-groups')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PermissionGroupController {
  constructor(
    private readonly permissionGroupService: PermissionGroupService,
  ) {}

  @Get()
  @RequirePermissions('permission_groups.read')
  async findAll() {
    return this.permissionGroupService.findAll();
  }

  @Get(':id')
  @RequirePermissions('permission_groups.read')
  async findById(@Param('id') id: string) {
    return this.permissionGroupService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @RequirePermissions('permission_groups.create')
  async create(@Body() dto: CreatePermissionGroupDto) {
    return this.permissionGroupService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('permission_groups.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionGroupDto,
  ) {
    return this.permissionGroupService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('permission_groups.delete')
  async delete(@Param('id') id: string) {
    return this.permissionGroupService.delete(id);
  }

  @Patch(':id/restore')
  @RequirePermissions('permission_groups.update')
  async restore(@Param('id') id: string) {
    return this.permissionGroupService.restore(id);
  }
}