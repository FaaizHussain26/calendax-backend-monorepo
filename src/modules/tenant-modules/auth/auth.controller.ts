// src/modules/tenant-modules/auth/auth.controller.ts
import { Body, Controller, HttpCode, Post, UseGuards, Request } from '@nestjs/common';
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  SelfRegisterDto,
  AdminCreateUserDto,
} from './auth.dto';
import { JwtAuthGuard } from '../../../common/jwt/jwt.provider';
import { AuthService } from './auth.service';
import { PermissionsGuard } from '../../../common/guards/permission.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { TenantUserRoles } from '../../../enums/tenant.enum';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';

@UseGuards(TenantGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @Post('register')
  async selfRegister(@Body() dto: SelfRegisterDto) {
    return this.authService.selfRegister(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Body() dto: ChangePasswordDto, @Request() req) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Post('users/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TenantUserRoles.TENANT_ADMIN)
  async adminCreateUser(@Body() dto: AdminCreateUserDto, @Request() req) {
    return this.authService.adminCreateUser(dto, req.tenantId);
  }
}
