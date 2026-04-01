// common/guards/tenant.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TenantConnectionManager } from '../database/tenant/tenant-connection.manager';
import { TenantRepository } from '../../modules/tenant/tenant.repository';
import { TenantStatus } from '../../enums/tenant.enum';
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private connectionManager: TenantConnectionManager,
    private readonly tenantRepository: TenantRepository,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    // Tenant identified via subdomain OR header
    // subdomain: tenant-abc.yourapp.com
    // header: x-tenant-id: tenant-abc
    const tenantId = req.headers['x-tenant-id'] ?? req.subdomains?.[0];

    if (!tenantId) throw new UnauthorizedException('No tenant context');
    const tenant = await this.tenantRepository.getByTenantId(tenantId);
    if (!tenant) throw new UnauthorizedException('Tenant not found');
    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new UnauthorizedException('Tenant is not active');
    }
    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.tenantConnection = await this.connectionManager.getConnection(tenant);
    return true;
  }
}
