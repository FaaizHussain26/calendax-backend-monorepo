import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

import { TokenBlacklistService } from './token-blacklist';
import { RedisService } from '../redis/redis.service';
import { AdminRoles } from '../../common/enums/admin.enum';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { HelperFunctions } from '../../common/utils/functions';
import { SignOptions } from 'jsonwebtoken';
import { CachedPermission, JwtPayload, SessionData, TokenUser } from '../../common/interfaces/request.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly redisService: RedisService, // use your service
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.secret') || 'default_secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, jti, exp } = payload;

    if (!sub || !jti) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const redis = this.redisService.getClient();

    // 1. Check blacklist
    const isBlacklisted = await this.tokenBlacklist.isBlacklisted(jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token revoked');
    }

    // 2. Get session from Redis
    const session = await redis.get(`session:${jti}`);

    if (!session) {
      throw new UnauthorizedException('Session expired');
    }
    const user = JSON.parse(session) as SessionData;
    // if (!user.isActive) {
    //   throw new UnauthorizedException('User inactive');
    // }

    // 3. Get permissions
    let permissions: string[] = [];

    if (user.role !== AdminRoles.SUPER_ADMIN) {
      const cachedPerms = await redis.get(`perm:${user.id}`);
      if (cachedPerms) {
        const parsed = JSON.parse(cachedPerms) as (string | CachedPermission)[];
        permissions = parsed.map((p) => (typeof p === 'string' ? p : p.key));
      }
    }
    return {
      id: user.id,
      role: user.role,
      tokenId: jti,
      exp: exp,
      userType: user.userType,
      permissions,
    };
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // skip JWT validation
    }

    return super.canActivate(context);
  }
}

@Injectable()
export class JwtHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async issueToken(user: TokenUser, permissions?: string[]) {
    const redis = this.redisService.getClient();
    const jti = randomUUID();
    const refreshJti = randomUUID();

    const expiresIn = this.configService.get<string>('jwt.expiresIn') || '1d';
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const redisExpiresIn = HelperFunctions.parseExpiryToSeconds(expiresIn);
    const refreshRedisExpiresIn = HelperFunctions.parseExpiryToSeconds(refreshExpiresIn);
    const secret = this.configService.get<string>('jwt.secret') || 'default_secret';
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

    const sessionData = {
      id: user.id,
      role: user.role,
      isActive: user.isActive,
      tenantId: user.tenantId ?? null,
      userType: user.userType ?? null,
      roleId: user.roleId ?? null,
    };
    // Store session
    await redis.set(`session:${jti}`, JSON.stringify(sessionData), 'EX', redisExpiresIn);
    await redis.set(
      `refresh:${refreshJti}`,
      JSON.stringify({
        ...sessionData,
        accessJti: jti, 
      }),
      'EX',
      refreshRedisExpiresIn,
    );
    // Store permissions
    if (permissions && permissions.length > 0) {
      await redis.set(`perm:${user.id}`, JSON.stringify(permissions), 'EX', redisExpiresIn);
    }

    const accessToken = this.jwtService.sign({ sub: user.id, role: user.role, jti }, {
      secret,
      expiresIn,
    } as SignOptions);

    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti: refreshJti }, // ✅ refresh has its own jti
      { secret: refreshSecret, expiresIn: refreshExpiresIn } as SignOptions,
    );

    return { accessToken, refreshToken };
  }
}
