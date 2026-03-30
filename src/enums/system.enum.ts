import { AdminRoles } from "./admin.enum";
import { TenantUserRoles } from "./tenant.enum";

export enum PermissionNames{
WRITE='write',
READ='read',
UPDATE='update',
DELETE='delete'

}


export const AllRoles = { ...AdminRoles, ...TenantUserRoles } as const;
export type AllRoles = typeof AllRoles[keyof typeof AllRoles];