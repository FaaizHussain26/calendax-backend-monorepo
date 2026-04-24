// src/modules/tenant-modules/user/user.module.ts
import { forwardRef, Module } from '@nestjs/common';

import { provideTenantRepository } from '@libs/database/tenant-repository.helper';
import { UserEntity } from './user.entity';
import { UsersRepository } from './user.repository';
import { TenantModule } from '../../tenant/tenant.module';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { RoleModule } from '../rbac/role/role.module';
import { PermissionModule } from '../rbac/permission/permission.module';
import { SiteModule } from '../site/site.module';

@Module({
  imports: [TenantModule, RoleModule, PermissionModule, forwardRef(() => SiteModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, provideTenantRepository(UserEntity)],
  exports: [UsersService, UsersRepository],
})
export class UserModule {}
