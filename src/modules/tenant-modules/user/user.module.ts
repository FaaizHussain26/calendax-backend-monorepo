// src/modules/tenant-modules/user/user.module.ts
import { Module } from '@nestjs/common';

import { provideTenantRepository } from '../../../common/database/tenant/tenant-repository.helper';
import { UserEntity } from './user.entity';
import { UsersRepository } from './user.repository';
import { TenantModule } from '../../tenant/tenant.module';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { RoleModule } from '../rbac/role/role.module';
import { PermissionModule } from '../rbac/permission/permission.module';

@Module({
  imports:[TenantModule,RoleModule,PermissionModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    provideTenantRepository(UserEntity),   // ✅ dynamic tenant connection
  ],
  exports: [
    UsersService,
    UsersRepository,                       // ✅ exported for AuthService
  ],
})
export class UserModule {}