// src/modules/admin/admin.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  AdminLoginDto,
  AssignPagePermissionDto,
  CreateAdminDto,
  RemovePagePermissionDto,
  UpdateAdminDto,
} from './admin.dto';
import { JwtAuthGuard } from '../../services/jwt/jwt.provider';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { Public } from '@libs/common/decorators/public.decorator';
import { AdminRoles } from '@libs/common/enums/admin.enum';
import type { RequestWithUser } from '@libs/common/interfaces/request.interface';
import { PaginationDto } from '@libs/common/dto/pagination.dto';
import { PermissionsGuard } from '@libs/common/guards/permission.guard';
import { Permission } from '@libs/common/decorators/permission.decorator';
import { PermissionNames } from '@libs/common/enums/system.enum';
import { SkipPermission } from '@libs/common/decorators/skip-permission.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(AdminRoles.ADMIN) 
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @Public()
  async logIn(@Body() dto: AdminLoginDto) {
    return this.adminService.logIn(dto.email, dto.password);
  }

  @Get()
  async getAll(@Query() query: PaginationDto, @Req() req: RequestWithUser) {
    return this.adminService.getAllAdmins(query, req.user.id);
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getAdminById(id);
  }

  @Post()
  async create(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.updateAdmin(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteAdmin(id);
  }

  @Get('/:id/permissions')
  async getPermissions(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getAdminPermissions(id);
  }

  @Permission(PermissionNames.UPDATE)
  @Post('/:id/permissions')
  async assignPermission(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignPagePermissionDto) {
    return this.adminService.assignPagePermission(id, dto);
  }

  @Permission(PermissionNames.UPDATE)
  @Delete('/:id/permissions')
  async removePermission(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RemovePagePermissionDto) {
    return this.adminService.removePagePermission(id, dto);
  }

  @Get('pages/side-bar')
  @SkipPermission() 
  async getAllPagesWithAdminPermissions(@Req() req: RequestWithUser) {
    return this.adminService.getMyPermissions(req.user);
  }
}
