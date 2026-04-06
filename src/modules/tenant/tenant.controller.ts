import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto, findTenantDto, UpdateTenantDto } from './tenant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { AllRoles, PermissionNames } from '../../enums/system.enum';
import { JwtAuthGuard } from '../../common/jwt/jwt.provider';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { AdminPage } from '../../enums/admin.enum';
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(AllRoles.SUPER_ADMIN, AllRoles.ADMIN)
@Controller('/tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Permission(AdminPage.TENANT, PermissionNames.READ)
  @Get('/')
  async getAllTenants(@Query() query: findTenantDto) {
    return await this.tenantService.getAllTenants(query);
  }
  @Permission(AdminPage.TENANT, PermissionNames.READ)
  @Get('/:id')
  async gettenantsById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.tenantService.getTenantById(id);
  }
  @Permission(AdminPage.TENANT, PermissionNames.WRITE)
  @Post('/')
  async createTenant(@Body() payload: CreateTenantDto) {
    return await this.tenantService.createTenant(payload);
  }
  @Permission(AdminPage.TENANT, PermissionNames.UPDATE)
  @Patch('/:id')
  async updateTenant(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateTenantDto) {
    return await this.tenantService.update(id, payload);
  }
  @Permission(AdminPage.TENANT, PermissionNames.DELETE)
  @Delete('/:id')
  async deleteTenant(@Param('id', ParseUUIDPipe) id: string) {
    return await this.tenantService.deleteTenant(id);
  }
}
