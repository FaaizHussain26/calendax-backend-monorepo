// src/database/audit.service.ts
import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
export interface IAuditLog {
  action: string;
  actorId: string;
  actorEmail: string;
  actorType: 'SUPER_ADMIN' | 'TENANT_USER';
  targetId?: string;
  payload: unknown;
  ipAddress: string;
  createdAt: Date;
}
@Injectable()
export class AuditService {

  async record(db: Db, data: Partial<IAuditLog>) {
    try {
      const collection = db.collection<IAuditLog>('audit_logs');

      const logEntry: IAuditLog = {
        action: data.action!,
        actorId: data.actorId!,
        actorEmail: data.actorEmail!,
        actorType: data.actorType || 'TENANT_USER',
        targetId: data.targetId,
        payload: data.payload || {},
        ipAddress: data.ipAddress || '0.0.0.0',
        createdAt: new Date(),
      };

      await collection.insertOne(logEntry);

      // Optional: Ensure index on createdAt for performance/TTL
      await collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error('Audit Logging Error:', error.message);
    }
  }
}
