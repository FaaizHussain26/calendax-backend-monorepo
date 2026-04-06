// src/database/master/seeders/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminEntity } from '../../modules/admin/entities/admin.entity';
import { AdminPermissionGroupEntity } from '../../modules/permission-group/permission-group.entity';
import { AdminPermissionEntity } from '../../modules/permission/permission.entity';
import { RootSeeder } from '../../seeders/root.seeder';
import { AdminSeeder } from '../../seeders/admin.seeder';
import { PermissionGroupSeeder } from '../../seeders/permission-group.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([AdminPermissionGroupEntity, AdminPermissionEntity, AdminEntity], 'master')],
  providers: [RootSeeder, AdminSeeder, PermissionGroupSeeder],
  exports: [RootSeeder],
})
export class SeederModule {}
