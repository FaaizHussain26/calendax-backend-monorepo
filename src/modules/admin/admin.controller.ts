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
import { JwtAuthGuard } from '../../common/jwt/jwt.provider';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AdminRoles } from '../../enums/admin.enum';
import type { RequestWithUser } from '../../common/interfaces/request.interface';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @Public()
  async logIn(@Body() dto: AdminLoginDto) {
    return this.adminService.logIn(dto.email, dto.password);
  }

  @Roles(AdminRoles.SUPER_ADMIN)
  @Get()
  async getAll() {
    return this.adminService.getAllAdmins();
  }

  @Roles(AdminRoles.SUPER_ADMIN)
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getAdminById(id);
  }

  @Roles(AdminRoles.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Roles(AdminRoles.SUPER_ADMIN)
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.updateAdmin(id, dto);
  }

  @Roles(AdminRoles.SUPER_ADMIN)
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteAdmin(id);
  }

  @Roles(AdminRoles.SUPER_ADMIN)
  @Get('/:id/permissions')
  async getPermissions(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getAdminPermissions(id);
  }

  @Roles(AdminRoles.SUPER_ADMIN)
  @Post('/:id/permissions')
  async assignPermission(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignPagePermissionDto) {
    return this.adminService.assignPagePermission(id, dto);
  }

  @Roles(AdminRoles.SUPER_ADMIN)
  @Delete('/:id/permissions')
  async removePermission(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RemovePagePermissionDto) {
    return this.adminService.removePagePermission(id, dto);
  }

  @Roles(AdminRoles.ADMIN)
  @Get('/pages/side-bar')
  async getAllPagesWithAdminPermissions(@Req() req: RequestWithUser) {
    return await this.adminService.findAllPagesWithAdminPermissions(req.user);
  }
}
