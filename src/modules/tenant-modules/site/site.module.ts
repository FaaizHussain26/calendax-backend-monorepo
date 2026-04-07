// site.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { SiteEntity } from './site.entity';
import { SiteRepository } from './site.repository';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { provideTenantRepository } from '../../../database/tenant/tenant-repository.helper';
import { UserModule } from '../user/user.module'; // 👈 import UserModule for UsersRepository
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [TenantModule, forwardRef(() => UserModule)],
  providers: [SiteService, SiteRepository, provideTenantRepository(SiteEntity)],
  controllers: [SiteController],
  exports: [SiteService, SiteRepository],
})
export class SiteModule {}
