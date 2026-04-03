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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwt/jwt.provider';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { AdminRoles } from '../../enums/admin.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreatePermissionDto,
  CreatePermissionGroupDto,
  UpdatePermissionGroupDto,
} from '../../common/dto/permission.dto';
import { AdminPermissionGroupService } from './permission-group.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin-permission-groups')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
export class AdminPermissionGroupController {
  constructor(private readonly service: AdminPermissionGroupService) {}

@Get()
async findAll(@Query() query: PaginationDto) {
  return this.service.findAll(query);
}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  async create(@Body() dto: CreatePermissionGroupDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePermissionGroupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return this.service.restore(id);
  }
  @Post(':id/permissions')
  @HttpCode(201)
  addCustomPermission(
    @Param('id') id: string,
    @Body() dto: CreatePermissionDto,
  ) {
    // add custom permission beyond CRUD
    // e.g. appointments.approve, appointments.export
    return this.service.addPermission(id, dto);
  }
}
