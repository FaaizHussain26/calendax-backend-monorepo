// interceptors/encrypt-response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createCipheriv, randomBytes } from 'crypto';

@Injectable()
export class EncryptResponseInterceptor implements NestInterceptor {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = Buffer.from(process.env.PAYLOAD_ENCRYPTION_KEY || 'dev_key', 'hex');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);
        const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
        return {
          encryptedData: {
            iv: iv.toString('hex'),
            data: encrypted.toString('hex'),
          },
        };
      }),
    );
  }
}
