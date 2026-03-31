// src/modules/tenant-modules/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  AdminCreateUserDto,
  ChangePasswordDto,
  LoginDto,
  ResetPasswordDto,
  SelfRegisterDto,
} from './auth.dto';
import { OtpPurpose } from '../../../enums/system.enum';
import { UserEntity } from '../user/user.entity';
import { HelperFunctions } from '../../../common/utils/functions';
import { UsersRepository } from '../user/user.repository';
import { OtpService } from './otp/otp.service';
import { PermissionEntity } from '../rbac/permission/permission.entity';
import { JwtHelper } from '../../../common/jwt/jwt.provider';
import { RedisService } from '../../../common/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly otpService: OtpService,
    private readonly jwtHelper: JwtHelper,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    await this.otpService.generateAndSend(user.email, OtpPurpose.VERIFICATION);
    return {
      requiresOtp: true,
      email: user?.email,
      message: 'OTP sent to your email',
    };
  }
  async selfRegister(dto: SelfRegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(dto.password, 10);
    await this.usersRepository.create({
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashed,
      userType: dto.userType,
      isActive: true,
    });

    return {
      requiresLogin: true,
      message: 'Registration successful. Please login.',
    };
  }
  async adminCreateUser(dto: AdminCreateUserDto, tenantId: string) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
    if (dto.roleId) {
      const role = await this.rolesRepository.findRoleById(dto.roleId);
      if (!role) throw new NotFoundException('Role not found');
    }
    // validate direct permissions
    let directPermissions: PermissionEntity[] = [];
    if (dto.permissionIds?.length) {
      directPermissions = await this.permissionsRepository.findByIds(
        dto.permissionIds,
      );
      if (directPermissions.length !== dto.permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }
    }
    // generate random password
    const rawPassword = HelperFunctions.generateSecurePassword(12);
    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = await this.usersRepository.create({
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashed,
      userType: dto.userType,
      roleId: dto.roleId ?? undefined,
      isActive: true,
      permissions: directPermissions,
    });

    if (dto.sendWelcomeEmail) {
      await this.otpService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        rawPassword,
      );
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      roleId: user.roleId,
      permissions: user.permissions?.map((p) => p.key) ?? [],
    };
  }

  async refreshTokens(refreshToken: string) {
    // verify refresh token using existing JwtHelper secret
    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findById(decoded.sub);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    const redis = this.redisService.getClient();
    const session = await redis.get(`session:${decoded.jti}`);
    const tenantId = session ? JSON.parse(session).tenantId : null;

    if (!tenantId) throw new UnauthorizedException('Session expired');

    const rolePermissions = user.role?.permissions?.map((p) => p.key) ?? [];
    const directPermissions = user.permissions?.map((p) => p.key) ?? [];
    const allPermissions = [
      ...new Set([...rolePermissions, ...directPermissions]),
    ];

    return this.jwtHelper.issueToken(
      {
        id: user.id,
        role: user.role?.name ?? 'staff',
        isActive: user.isActive,
        tenantId, // ✅ carry over tenantId from old session
        userType: user.userType,
        roleId: user.roleId,
      },
      allPermissions,
    );
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return { message: 'If this email exists, an OTP has been sent' };
    }

    await this.otpService.generateAndSend(
      user.email,
      OtpPurpose.RESET_PASSWORD,
    );

    return {
      userId: user.id,
      message: 'If this email exists, an OTP has been sent',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    await this.otpService.verify(
      dto.userId,
      dto.code,
      OtpPurpose.RESET_PASSWORD,
    );

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.update(dto.userId, { password: hashed });

    await this.otpService.invalidate(dto.userId, OtpPurpose.RESET_PASSWORD);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.usersRepository.findById(userId, {
      selectPassword: true,
    });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.update(userId, { password: hashed });

    return { message: 'Password changed successfully' };
  }
}
