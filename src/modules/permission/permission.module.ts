// src/modules/admin/permission/permission.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPermissionController } from './permission.controller';
import { AdminPermissionService } from './permission.service';
import { AdminPermissionRepository } from './permission.repository';
import { AdminPermissionEntity } from './permission.entity';
import { AdminPermissionGroupModule } from '../permission-group/permission-group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminPermissionEntity], 'master'),
    AdminPermissionGroupModule, // ✅ for group validation in service
  ],
  controllers: [AdminPermissionController],
  providers: [AdminPermissionService, AdminPermissionRepository],
  exports: [
    AdminPermissionService,
    AdminPermissionRepository, // ✅ exported for TenantService seeding
  ],
})
export class AdminPermissionModule {}
