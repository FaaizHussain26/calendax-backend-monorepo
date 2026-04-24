// src/common/guards/internal-api-key.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-internal-api-key'];
    const expectedKey = this.config.get<string>('internal.apiKey');

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal API key.');
    }

    return true;
  }
}