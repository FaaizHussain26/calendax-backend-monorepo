import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminPage, Roles } from '../enums/admin.enum';
import { PERMISSION_KEY, PermissionAction } from '../decorators/permission.decorator';
import { AllRoles } from '../enums/system.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_PERMISSION_KEY } from '../decorators/skip-permission.decorator';

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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const skipPermission = this.reflector.getAllAndOverride<boolean>(SKIP_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipPermission) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const required = this.reflector.get<{
      action: PermissionAction;
      resource?: string;
    }>(PERMISSION_KEY, context.getHandler());

    if (!user) {
      throw new ForbiddenException('Unauthenticated');
    }
    // ✅ SUPER ADMIN = FULL ACCESS
    if (user.role === Roles.SUPER_ADMIN) {
      return true;
    }
    // if (user.userType === AllRoles.TENANT_ADMIN && req.tenantId) {
    //   return true;
    // }
    const permissions: string[] = user.permissions || [];
    const pageId = req.headers['x-page-id'] as string;

    const resource = required?.resource ?? pageId;
    const action = required?.action ?? this.extractAction(req.method);
    if (!resource) return true;

    const hasPermission = permissions.includes(`${resource}.${action}`);
    if (!hasPermission) {
      throw new ForbiddenException(`No ${action} access to ${resource}`);
    }

    return true;
  }
}
