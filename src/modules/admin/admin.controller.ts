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
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto, CreateAdminDto, UpdateAdminDto } from './admin.dto';
import { JwtAuthGuard } from '../../common/jwt/jwt.provider';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AdminRoles } from '../../enums/admin.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRoles.SUPER_ADMIN)             // ✅ all routes require SUPER_ADMIN by default
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @Public()                                // ✅ skip JWT + roles check
  @HttpCode(200)
  async logIn(@Body() dto: AdminLoginDto) {
    return this.adminService.logIn(dto.email, dto.password);
  }

  @Get()
  async getAll() {
    return this.adminService.getAllAdmins();
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getAdminById(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.adminService.updateAdmin(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteAdmin(id);
  }
}