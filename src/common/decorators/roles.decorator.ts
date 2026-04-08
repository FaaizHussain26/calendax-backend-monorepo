import { SetMetadata } from '@nestjs/common';
import { Roles as RolesEnum } from '../enums/admin.enum';
import { AllRoles } from '../enums/system.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AllRoles[]) => SetMetadata(ROLES_KEY, roles);
