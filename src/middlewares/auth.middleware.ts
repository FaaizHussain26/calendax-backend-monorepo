import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
// import { isBlacklisted } from '../../../utils/tokenBlacklist';
const blacklistedTokens = new Set<string>();
 
export const isBlacklisted = (jti: string): boolean => {
  return blacklistedTokens.has(jti);
};
@Injectable()
export class AuthMiddleware implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
 
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }
 
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'school_app',
      ) as jwt.JwtPayload;
 
      // 🚫 Reject if blacklisted
      if (!decoded?.id || isBlacklisted(decoded?.id)) {
        //
        throw new UnauthorizedException('Token has been blacklisted');
      }
      // ✅ Attach decoded info to request
      request.context = request.context || {};
 
      request.context.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
 