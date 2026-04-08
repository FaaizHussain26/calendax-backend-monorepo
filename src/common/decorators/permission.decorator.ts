// permission.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PermissionNames } from '../enums/system.enum';

export const PERMISSION_KEY = 'permission';

export type PermissionAction =
  | PermissionNames.READ
  | PermissionNames.WRITE
  | PermissionNames.UPDATE
  | PermissionNames.DELETE;

export const Permission = (resource: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { resource, action });
