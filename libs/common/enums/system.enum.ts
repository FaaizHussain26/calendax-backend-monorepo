import { AdminRoles } from './admin.enum';
import { TenantUserRoles } from './tenant.enum';

export enum PermissionNames {
  WRITE = 'write',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
export enum OtpPurpose {
  GENERAL = 'general',
  VERIFICATION = 'verification',
  RESET_PASSWORD = 'reset_password',
}

export enum OtpStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export const AllRoles = { ...AdminRoles, ...TenantUserRoles } as const;
export type AllRoles = (typeof AllRoles)[keyof typeof AllRoles];
