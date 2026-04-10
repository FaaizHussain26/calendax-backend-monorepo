import { SetMetadata } from '@nestjs/common';
import { AdminPage } from '../enums/admin.enum';
import { PermissionNames } from '../enums/system.enum';

export const PERMISSION_KEY = 'permission';

export type PermissionAction =
  | PermissionNames.READ
  | PermissionNames.WRITE
  | PermissionNames.UPDATE
  | PermissionNames.DELETE;

export interface PermissionMetadata {
  action: PermissionAction;
  resource?: string;
}

// ✅ action first (required), resource second (optional)
export const Permission = (action: PermissionAction, resource?: string) =>
  SetMetadata<string, PermissionMetadata>(PERMISSION_KEY, { action, resource });