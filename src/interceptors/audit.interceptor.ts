// src/common/interceptors/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../database/audit-logs/audit.service';
import { MongoAdminService } from '../database/master/mongo-admin.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly mongoAdmin: MongoAdminService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip, user, tenantConnection } = req;

    // Only log write operations (POST, PUT, PATCH, DELETE) to keep DB clean
    if (method === 'GET') return next.handle();

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          let targetDb;
          let actorType: 'SUPER_ADMIN' | 'TENANT_USER' = 'TENANT_USER';

          // 1. DETERMINE THE CONTEXT
          if (tenantConnection?.mongo) {
            targetDb = tenantConnection.mongo;
            actorType = 'TENANT_USER';
          } else {
            targetDb = this.mongoAdmin.clientInstance.db('system_admin_logs');
            actorType = 'SUPER_ADMIN';
          }
          const logBody = { ...req.body };
          const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'refreshToken'];

          sensitiveFields.forEach((field) => {
            if (logBody[field]) logBody[field] = '********';
          });
          // 2. RECORD THE LOG
          this.auditService.record(targetDb, {
            action: `${method} ${url}`,
            actorId: user?.id || 'anonymous',
            actorEmail: user?.email || 'unknown',
            actorType: actorType,
            ipAddress: ip,
            payload: {
              request: logBody,
              response: responseData?.message || 'Success',
            },
          });
        } catch (error) {
          console.error('Audit Interceptor Error:');
        }
      }),
    );
  }
}
