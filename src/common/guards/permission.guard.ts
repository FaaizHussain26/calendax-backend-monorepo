import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../../enums/admin.enum';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { AllRoles } from '../../enums/system.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

    private extractResource(path: string): string {
    // '/api/patients/123' → 'patients'
    const parts = path.replace(/^\/api\//, '').split('/');
    return parts[0];
  }

  private extractAction(method: string): string {
    const map: Record<string, string> = {
      GET: 'read',
      POST: 'write',
      PATCH: 'update',
      PUT: 'update',
      DELETE: 'delete',
    };
    return map[method] ?? 'read';
  }

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
console.log("user role in permissions:",req.tenantId,user.role,user.userType)
    // ✅ SUPER ADMIN = FULL ACCESS
    if (user.role === Roles.SUPER_ADMIN) {
      return true;
    }
    if (user.userType === AllRoles.TENANT_ADMIN && req.tenantId) {
      return true;
    }
    const permissions: string[] = user.permissions || [];

    if (required) {
      // explicit permission check (admin module)
      const perm = permissions.find(
        (p) => p === `${required.resource}.${required.action}`,
      );
      if (!perm) {
        throw new ForbiddenException(
          `No ${required.action} access to ${required.resource}`,
        );
      }
      return true;
    }
    const resource = this.extractResource(req.path); // e.g 'patients' from '/api/patients'
    const action = this.extractAction(req.method); // e.g 'read' from 'GET'

    const hasPermission = permissions.includes(`${resource}.${action}`);
    if (!hasPermission) {
      throw new ForbiddenException(`No ${action} access to ${resource}`);
    }

    return true;
  }

}
