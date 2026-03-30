import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

import { TokenBlacklistService } from './token-blacklist';
import { RedisService } from '../redis/redis.service';
import { AdminRoles } from '../../enums/admin.enum';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { HelperFunctions } from '../utils/functions';

export interface JwtPayload {
  sub: string;
  role: string;
  jti: string;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly redisService: RedisService, // ✅ use your service
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

    // ✅ 1. Check blacklist
    const isBlacklisted = await this.tokenBlacklist.isBlacklisted(jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token revoked');
    }

    // ✅ 2. Get session from Redis
    const session = await redis.get(`session:${jti}`);

    if (!session) {
      throw new UnauthorizedException('Session expired');
    }
    const user = JSON.parse(session);

    // if (!user.isActive) {
    //   throw new UnauthorizedException('User inactive');
    // }

    // ✅ 3. Get permissions
    let permissions: any[] = [];

    if (user.role === AdminRoles.ADMIN) {
      const cachedPerms = await redis.get(`admin_perm:${user.id}`);
      permissions = cachedPerms ? JSON.parse(cachedPerms) : [];
    }

    return {
      _id: user.id,
      role: user.role,
      tokenId: jti,
      exp: exp,
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
      return true; // ✅ skip JWT validation
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

  async issueToken(user: any, permissions?: any[]) {
    const redis = this.redisService.getClient();

    const jti = randomUUID();

    const payload: JwtPayload = {
      sub: user.id?.toString(),
      role: user.role,
      jti,
    };

    const expiresIn = this.configService.get<number>('jwt.expiresIn') || `1d`;
    const redisExpiresIn=HelperFunctions.parseExpiryToSeconds(expiresIn)
    const secret =
      this.configService.get<string>('jwt.secret') || 'default_secret';
    console.log('jwt ex and sec:', expiresIn,redisExpiresIn, secret);
    // ✅ Store session
    await redis.set(
      `session:${jti}`,
      JSON.stringify({
        id: user.id,
        role: user.role,
        isActive: user.isActive,
      }),
      'EX',
      redisExpiresIn,
    );

    // ✅ Store permissions
    if (permissions && permissions.length > 0) {
      await redis.set(
        `admin_perm:${user.id}`,
        JSON.stringify(permissions),
        'EX',
        redisExpiresIn,
      );
    }

    return {
      accessToken: this.jwtService.sign(payload, {
        secret,
        expiresIn: this.configService.get<number>('jwt.expiresIn'),
      }),
    };
  }
}
