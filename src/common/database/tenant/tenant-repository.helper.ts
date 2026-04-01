// src/common/helpers/tenant-repository.helper.ts
import { DataSource, ObjectType } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Scope } from '@nestjs/common';
import { TenantConnectionManager } from './tenant-connection.manager';
import { TenantEntity } from '../../../modules/tenant/tenant.entity';

export function provideTenantRepository<T>(entity: ObjectType<T>) {
  return {
    provide: `${entity.name}Repository`,
    scope: Scope.REQUEST, // new instance per request
    inject: [TenantConnectionManager, REQUEST],
    useFactory: async (
      req: Request & {
        tenantId: string;
        tenant: TenantEntity;
        tenantConnection: any;
      },
    ) => {
      const connection: DataSource = req.tenantConnection;
      if (!connection) {
        throw new Error(
          `Tenant context missing for ${entity.name}Repository. ` +
            `Ensure TenantGuard is applied to this route.`,
        );
      }
      return connection.getRepository(entity);
    },
  };
}
