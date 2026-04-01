// src/modules/tenant-modules/rbac/permission/permission.controller.ts
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
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from '../../../../common/jwt/jwt.provider';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../../../../common/dto/permission.dto';
import { PermissionsGuard } from '../../../../common/guards/permission.guard';

@Controller('rbac/permissions')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  @Get()
  findAll() {
    return this.service.findAll();
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
  @HttpCode(201)
  create(
    @Param('groupId') groupId: string,
    @Body() dto: CreatePermissionDto,
  ) {
    return this.service.create(groupId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
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