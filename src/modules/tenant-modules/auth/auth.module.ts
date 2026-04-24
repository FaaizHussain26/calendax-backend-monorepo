import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../../services/jwt/jwt.provider';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { RbacModule } from '../rbac/rbac.module';
import { TenantModule } from '../../tenant/tenant.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [TenantModule, UserModule, RbacModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
