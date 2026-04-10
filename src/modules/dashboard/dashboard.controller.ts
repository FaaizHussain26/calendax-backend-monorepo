import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../services/jwt/jwt.provider';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { AllRoles } from '../../common/enums/system.enum';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(AllRoles.SUPER_ADMIN)
export class DashboardController {
  constructor(public readonly dashboardService: DashboardService) {}

  @Get('/')
  getDashbordStat() {
    return this.dashboardService.getstats();
  }
}
