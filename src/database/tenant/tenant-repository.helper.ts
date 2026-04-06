import { Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ObjectType } from 'typeorm';
import { Db } from 'mongodb';
import { TenantRequest } from '../../common/interfaces/request.interface';

export function provideTenantRepository<T>(entity: ObjectType<T>) {
  return {
    provide: `${entity.name}Repository`,
    scope: Scope.REQUEST,
    inject: [REQUEST],
    useFactory: (req: TenantRequest) => {
      const sqlConnection = req.tenantConnection?.sql;
      // console.log("tenant conn:",req.tenantConnection)
      if (!sqlConnection) {
        // This will tell you if the Guard failed to attach the DB
        throw new Error(`Tenant SQL connection not found for ${entity.name}. Check if TenantGuard is applied.`);
      }

      return sqlConnection.getRepository(entity);
    },
  };
}

// 2. Helper for the Tenant's MongoDB (Single Global Token)
export const TENANT_MONGO_DB = {
  provide: 'TENANT_MONGO_DB',
  scope: Scope.REQUEST,
  inject: [REQUEST],
  useFactory: (req: TenantRequest): Db | undefined => req.tenantConnection?.mongo,
};
