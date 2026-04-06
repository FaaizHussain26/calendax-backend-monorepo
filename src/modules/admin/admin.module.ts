import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminEntity } from './entities/admin.entity';
import { AdminPermissions } from './entities/admin-permissions.entity';
import { JwtCommonModule } from '../../common/jwt/jwt.module';
import { PageModule } from '../page/page.module';

const services = [AdminService];
const repositories = [AdminRepository];
const controllers = [AdminController];

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity, AdminPermissions], 'master'), JwtCommonModule, PageModule],
  controllers,
  providers: [...services, ...repositories],
  exports: [],
})
export class AdminModule {}
