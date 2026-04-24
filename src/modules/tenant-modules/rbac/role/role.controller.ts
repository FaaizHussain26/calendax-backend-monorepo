// src/modules/tenant-modules/rbac/role/role.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../../../../services/jwt/jwt.provider';
import { TenantGuard } from '@libs/common/guards/tenant.guard';
import { AssignPermissionsDto, CreateRoleDto, UpdateRoleDto } from './role.dto';
import { PermissionsGuard } from '@libs/common/guards/permission.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, TenantGuard)
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/permissions/assign')
  @HttpCode(200)
  assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    return this.service.assignPermissions(id, dto);
  }

  @Post(':id/permissions/revoke')
  @HttpCode(200)
  revokePermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    return this.service.revokePermissions(id, dto);
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
