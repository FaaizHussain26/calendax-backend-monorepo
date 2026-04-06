import { Module } from '@nestjs/common';
import { AdminPermissionModule } from '../permission/permission.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPermissionGroupEntity } from './permission-group.entity';
import { AdminPermissionGroupController } from './permission-group.controller';
import { AdminPermissionGroupService } from './permission-group.service';
import { AdminPermissionEntity } from '../permission/permission.entity';
import { AdminPermissionGroupRepository } from './permission-group.repository';
import { AdminPermissionRepository } from '../permission/permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AdminPermissionGroupEntity, AdminPermissionEntity], 'master')],
  controllers: [AdminPermissionGroupController],
  providers: [AdminPermissionGroupService, AdminPermissionGroupRepository, AdminPermissionRepository],
  exports: [AdminPermissionGroupService, AdminPermissionGroupRepository],
})
export class AdminPermissionGroupModule {}
