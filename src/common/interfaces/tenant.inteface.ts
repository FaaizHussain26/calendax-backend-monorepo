import { AdminPermissionGroupEntity } from '../../modules/permission-group/permission-group.entity';
import { CreateTenantDto } from '../../modules/tenant/tenant.dto';

export interface TenantJobData {
  tenantId: string;
  dto: CreateTenantDto;
  permissionGroup:AdminPermissionGroupEntity[] 
  dbName: string;
  slug: string;
  dbPassword: string;
}
