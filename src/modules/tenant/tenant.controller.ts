import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto, findTenantDto, UpdateTenantDto } from './tenant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { AllRoles, PermissionNames } from '../../common/enums/system.enum';
import { JwtAuthGuard } from '../../services/jwt/jwt.provider';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { AdminPage } from '../../common/enums/admin.enum';
import { Public } from '../../common/decorators/public.decorator';
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(AllRoles.SUPER_ADMIN, AllRoles.ADMIN)
@Controller('/tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Get('/')
  async getAllTenants(@Query() query: findTenantDto) {
    return await this.tenantService.getAllTenants(query);
  }
  @Get('/:id')
  async gettenantsById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.tenantService.getTenantById(id);
  }
@Public()
  @Get('/slug/:slug')
  async gettenantsBySlug(@Param('slug') slug: string) {
    return await this.tenantService.getTenantBySlug(slug);
  }
  @Post('/')
  async createTenant(@Body() payload: CreateTenantDto) {
    return await this.tenantService.createTenant(payload);
  }
  @Patch('/:id')
  async updateTenant(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateTenantDto) {
    return await this.tenantService.update(id, payload);
  }
  @Delete('/:id')
  async deleteTenant(@Param('id', ParseUUIDPipe) id: string) {
    return await this.tenantService.deleteTenant(id);
  }
}
