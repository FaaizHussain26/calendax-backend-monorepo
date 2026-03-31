// src/common/helpers/tenant-repository.helper.ts
import { DataSource, ObjectType } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Scope } from '@nestjs/common';
import { TenantConnectionManager } from './tenant-connection.module';
import { TenantEntity } from '../../../modules/tenant/tenant.entity';

export function provideTenantRepository<T>(entity: ObjectType<T>) {
  return {
    provide: `${entity.name}Repository`,
    scope: Scope.REQUEST, // new instance per request
    inject: [TenantConnectionManager, REQUEST],
    useFactory: async (
      manager: TenantConnectionManager,
      req: Request & { tenantId: string; tenant: TenantEntity },
    ) => {
      const connection = await manager.getConnection(req.tenant);
      return connection.getRepository(entity);
    },
  };
}
