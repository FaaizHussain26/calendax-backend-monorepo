import { Request } from 'express';
import { DataSource } from 'typeorm';
import { Db } from 'mongodb';

interface TenantConnection {
  sql: DataSource;
  mongo?: Db;
}

export interface TenantContext {
  id: string;
  slug: string;
  dbName: string;
  dbHost?: string;
  dbPort?: number;
  dbUser?: string;
  dbPassword?: string;
  mongoUri?: string;
}

export interface TenantRequest extends Request {
  tenantConnection: TenantConnection;
  tenant: TenantContext;
  tenantId: string;
}

export interface RequestWithUser extends Request {
  user: TokenUser;
}

export interface TokenUser {
  id: string;
  role: string;
  isActive?: boolean;
  tenantId?: string;
  userType?: string;
  roleId?: string;
  tokenId?: string;
  exp?: number;
  permissions?: string[];
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