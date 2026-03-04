import { CanActivate, ExecutionContext, Injectable,  UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SKIP_AUTH_KEY } from "../decorators/skip-auth.decorator";
import { JwtService } from "@nestjs/jwt";
import { JWTService } from "../commonservices/jwt.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor (
        private reflector: Reflector,
        private jwtService: JwtService,
        private readonly localJwtService: JWTService,
    ) {}

    async canActivate(context: ExecutionContext) {
        const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipAuth) return true;

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if(!authHeader){
            throw new UnauthorizedException('Missing Authorization Header');
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization format');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.localJwtService.readPublicKey(),
            } as any);
            request.user = payload;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
        
    }    
}