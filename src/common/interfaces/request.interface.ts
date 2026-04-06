import { Request } from 'express';
import { DataSource } from 'typeorm';
import { TenantEntity } from '../../modules/tenant/tenant.entity';
import { Db } from 'mongodb';
interface TenantConnection {
  sql: DataSource;
  mongo?: Db;
}

export interface TenantRequest extends Request {
  tenantConnection?: TenantConnection;
  tenant: TenantEntity;
  tenantId: string;
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
    role: string;
    tokenId: string;
    exp: number;
    permissions: string[];
  };
}
export interface TokenUser {
  id: string;
  role: string;
  isActive?: boolean;
  tenantId?: string;
  userType?: string;
  roleId?: string;
}
export interface JwtPayload {
  sub: string;
  role: string;
  jti: string;
  exp?: number;
  tenantId?: string;
}
export interface CachedPermission {
  key: string;
}
export interface SessionData {
  id: string;
  role: string;
  isActive: boolean;
  tenantId: string | null;
  userType: string | null;
  roleId: string | null;
}
export interface HttpErrorResponse {
  message?: string;
  error?: string;
}
