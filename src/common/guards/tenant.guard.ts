// // common/guards/tenant.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

// src/common/guards/tenant.guard.ts
@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    if (!req.tenantConnection) {
      throw new UnauthorizedException('Invalid or missing tenant context');
    }

    return true;
  }
}
