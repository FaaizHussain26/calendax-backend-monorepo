// src/common/middleware/tenant-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { TenantRepository } from '../modules/tenant/tenant.repository';
import { TenantConnectionManager } from '../common/database/tenant/tenant-connection.manager';
import { TenantStatus } from '../enums/tenant.enum';
import { TenantRequest } from '../common/interfaces/request.interface';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly connectionManager: TenantConnectionManager,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] ?? req.subdomains?.[0];

    if (tenantId) {
      try {
        const tenant = await this.tenantRepository.getByTenantId(tenantId?.toString());
        if (tenant && tenant.status === TenantStatus.ACTIVE) {
          req.tenant = tenant;
          req.tenantId = tenant.id;
          // ⚡ PRE-LOAD: This ensures the factory finds the connection!
          req.tenantConnection = await this.connectionManager.getConnection(tenant);
        }
      } catch (error) {
        console.error('Tenant Middleware Error:', error.message);
      }
    }

    next();
  }
}
