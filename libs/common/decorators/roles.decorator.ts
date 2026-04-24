import { SetMetadata } from '@nestjs/common';
import { AllRoles } from '../enums/system.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AllRoles[]) => SetMetadata(ROLES_KEY, roles);
