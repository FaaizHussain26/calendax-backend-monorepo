// src/common/database/audit/audit.module.ts
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { MongoAdminModule } from '../master/mongo-admin.module';

@Global()
@Module({
  imports: [MongoAdminModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
