// // common/guards/tenant.guard.ts
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
// @Injectable()
// export class TenantGuard implements CanActivate {
//   constructor(
//     private connectionManager: TenantConnectionManager,
//     private readonly tenantRepository: TenantRepository,
//   ) {}

//   async canActivate(ctx: ExecutionContext): Promise<boolean> {
//     const req = ctx.switchToHttp().getRequest();

//     // Tenant identified via subdomain OR header
//     // subdomain: tenant-abc.yourapp.com
//     // header: x-tenant-id: tenant-abc
//     const tenantId = req.headers['x-tenant-id'] ?? req.subdomains?.[0];
// console.log("tenantid:::",tenantId)
//     if (!tenantId) throw new UnauthorizedException('No tenant context provided');
//     const tenant = await this.tenantRepository.getByTenantId(tenantId);
//     console.log('tenant found:',tenant)
//     if (!tenant) throw new UnauthorizedException('Tenant not found');
//     if (tenant.status !== TenantStatus.ACTIVE) {
// throw new ForbiddenException(`Tenant is ${tenant.status.toLowerCase()}`); 
//    }
//     req.tenant = tenant;
//     req.tenantId = tenant.id;
//     req.tenantConnection = await this.connectionManager.getConnection(tenant);
//     return true;
//   }
// }
// src/common/guards/tenant.guard.ts
@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    if (!req.tenantConnection) {
      throw new UnauthorizedException('Invalid or missing tenant context');
    }

    return true;
  }
}