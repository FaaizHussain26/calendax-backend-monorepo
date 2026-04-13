import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../admin/admin.repository';
import { PageRepository } from '../page/page.repository';
import { AdminPermissionGroupRepository } from '../permission-group/permission-group.repository';
import { TenantRepository } from '../tenant/tenant.repository';

@Injectable()
export class DashboardService {
  constructor(
    public readonly pageRepository: PageRepository,
    public readonly permissionGroupRepository: AdminPermissionGroupRepository,
    public readonly tenantRepository: TenantRepository,
    public readonly adminRepository: AdminRepository,
  ) {}

  async getstats() {
    const [pages, permissionGroup, tenant, admin] = await Promise.allSettled([
      this.pageRepository.count(),
      this.permissionGroupRepository.count(),
      this.tenantRepository.count(),
      this.adminRepository.count(),
    ]);
    return {
      totolPage: pages.status === 'fulfilled' ? pages.value : 0,
      totolPermissionGroup: permissionGroup.status === 'fulfilled' ? permissionGroup.value : 0,
      totalTenant: tenant.status === 'fulfilled' ? tenant.value : 0,
      totalAdmin: admin.status === 'fulfilled' ? admin.value : 0,
    };
  }
}
