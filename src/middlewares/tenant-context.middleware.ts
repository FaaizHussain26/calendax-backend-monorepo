// src/common/middleware/tenant-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { TenantRepository } from '../modules/tenant/tenant.repository';
import { TenantConnectionManager } from '../database/tenant/tenant-connection.manager';
import { TenantStatus } from '../common/enums/tenant.enum';
import { TenantRequest } from '../common/interfaces/request.interface';
import { RedisHelper } from '../services/redis/redis.helper';
import { TenantEntity } from '../modules/tenant/tenant.entity';
const TENANT_CACHE_TTL = 60 * 5; // 5 min
const tenantCacheKey = (id: string) => `tenant:${id}`;
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly connectionManager: TenantConnectionManager,
    private readonly redisHelper: RedisHelper,
  ) {}
  private async resolveTenant(tenantId: string): Promise<TenantEntity | null> {
    const cacheKey = tenantCacheKey(tenantId);

    const cached = await this.redisHelper.get<TenantEntity>(cacheKey);
    if (cached) return cached;

    const tenant = await this.tenantRepository.getByTenantId(tenantId);
    if (!tenant) return null;

    await this.redisHelper.set(cacheKey, tenant, TENANT_CACHE_TTL);

    return tenant;
  }
  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] ?? req.subdomains?.[0];

    if (tenantId) {
      try {
        const tenant = await this.resolveTenant(tenantId.toString());
        if (tenant && tenant.status === TenantStatus.ACTIVE) {
          req.tenant = tenant;
          req.tenantId = tenant.id;
          // ⚡ PRE-LOAD: This ensures the factory finds the connection!
          req.tenantConnection = await this.connectionManager.getConnection(tenant);
        }
      } catch (error) {
        console.error('Tenant Middleware Error:');
      }
    }

    next();
  }
}
