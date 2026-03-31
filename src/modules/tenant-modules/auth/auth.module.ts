import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/jwt/jwt.provider';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [JwtAuthGuard, UserModule,RbacModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
