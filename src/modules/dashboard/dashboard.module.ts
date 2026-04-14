import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { PageModule } from '../page/page.module';
import { AdminPermissionGroupModule } from '../permission-group/permission-group.module';
import { TenantModule } from '../tenant/tenant.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

const controllers = [DashboardController];
const services = [DashboardService];
@Module({
  imports: [PageModule,AdminPermissionGroupModule,TenantModule,AdminModule],
  controllers,
  providers: [...services],
  exports: [],
})
export class DashboardModule {}
