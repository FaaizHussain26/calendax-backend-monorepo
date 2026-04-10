// src/database/audit.service.ts
import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { ADMIN_LOGS_DOCUMENT_COLLECTION, IAuditLog } from '../../common/interfaces/collections/audit-log.interface';

@Injectable()
export class AuditService {
  async record(db: Db, data: Partial<IAuditLog>) {
    try {
      const collection = db.collection<IAuditLog>(ADMIN_LOGS_DOCUMENT_COLLECTION);

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
    } catch (error:any) {
      console.error('Audit Logging Error:', error.message);
    }
  }
}
