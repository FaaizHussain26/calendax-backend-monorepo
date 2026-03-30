import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto, CreateAdminDto, UpdateAdminDto } from './admin.dto';
import { JwtAuthGuard } from '../../common/jwt/jwt.provider';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { AllRoles } from '../../enums/system.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AllRoles.SUPER_ADMIN)
@Controller('/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Public()
  @Post('/login')
  async logIn(@Body() dto: AdminLoginDto) {
    return await this.adminService.logIn(dto.email, dto.password);
  }
  @Get('/')
  async getAll() {
    return await this.adminService.getAllAdmins();
  }

  @Get('/:id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.getAdminById(id);
  }

  @Post('/')
  async createAdmin(@Body() payload: CreateAdminDto) {
    return await this.adminService.createAdmin(payload);
  }

  @Patch('/:id')
  async updateAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateAdminDto,
  ) {
    return await this.adminService.updateAdmin(id, payload);
  }

  @Delete('/:id')
  async deleteAdmin(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteAdmin(id);
    return { message: 'Admin deleted successfully' };
  }
}
