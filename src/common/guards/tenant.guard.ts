// common/guards/tenant.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { TenantConnectionManager } from '../database/tenant/tenant-connection.module';
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private connectionManager: TenantConnectionManager) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    // Tenant identified via subdomain OR header
    // subdomain: tenant-abc.yourapp.com
    // header: x-tenant-id: tenant-abc
    const tenantId =
      req.headers['x-tenant-id'] ??
      req.subdomains?.[0];

    if (!tenantId) throw new UnauthorizedException('No tenant context');

    // Attach connection to request — available everywhere downstream
    req.tenantId = tenantId;
    req.tenantConnection = await this.connectionManager.getConnection(tenantId);

    return true;
  }
}