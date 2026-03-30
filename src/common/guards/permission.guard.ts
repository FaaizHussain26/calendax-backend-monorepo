import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {  Roles } from '../../enums/admin.enum';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const required = this.reflector.get<{
      resource: string;
      action: 'read' | 'write';
    }>(PERMISSION_KEY, context.getHandler());

    if (!user) {
      throw new ForbiddenException('Unauthenticated');
    }

    // ✅ SUPER ADMIN = FULL ACCESS
    if (user.role === Roles.SUPER_ADMIN) {
      return true;
    }

    const permissions = user.permissions || [];

    const perm = permissions.find((p) => p.resource === required.resource);

    if (!perm || !perm[required.action]) {
      throw new ForbiddenException(
        `No ${required.action} access to ${required.resource}`,
      );
    }

    return true;
  }
}
