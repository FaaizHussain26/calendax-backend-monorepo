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
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
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
  @Permission(AdminPage.PAGE, PermissionNames.READ)
  @Get('/')
  async getAllTenants() {
    return await this.tenantService.getAllTenants();
  }
  @Permission(AdminPage.PAGE, PermissionNames.READ)
  @Get('/:id')
  async gettenantsById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.tenantService.getTenantById(id);
  }
  @Permission(AdminPage.PAGE, PermissionNames.WRITE)
  @Post('/')
  async createTenant(@Body() payload: CreateTenantDto) {
    return await this.tenantService.createTenant(payload);
  }
  @Permission(AdminPage.PAGE, PermissionNames.UPDATE)
  @Patch('/:id')
  async updateTenant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateTenantDto,
  ) {
    return await this.tenantService.update(id, payload);
  }
  @Permission(AdminPage.PAGE, PermissionNames.DELETE)
  @Delete('/:id')
  async deleteTenant(@Param('id', ParseUUIDPipe) id: string) {
    return await this.tenantService.deleteTenant(id);
  }
}
