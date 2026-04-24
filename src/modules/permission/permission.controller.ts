// src/modules/admin/permission/permission.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminPermissionService } from './permission.service';
import { JwtAuthGuard } from '../../services/jwt/jwt.provider';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { AdminRoles } from '@libs/common/enums/admin.enum';
import { CreatePermissionDto, UpdatePermissionDto } from '@libs/common/dto/permission.dto';
import { PaginationDto } from '@libs/common/dto/pagination.dto';

@Controller('admin-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
export class AdminPermissionController {
  constructor(private readonly service: AdminPermissionService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
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
  @HttpCode(201)
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
