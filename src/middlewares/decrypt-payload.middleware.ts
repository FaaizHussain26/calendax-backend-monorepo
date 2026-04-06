// middleware/decrypt-payload.middleware.ts
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { createDecipheriv, createCipheriv, randomBytes } from 'crypto';
import { NextFunction } from 'express';
import { EncryptedRequest } from '../common/interfaces/encryption.interface';

@Injectable()
export class DecryptPayloadMiddleware implements NestMiddleware {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = Buffer.from(process.env.PAYLOAD_ENCRYPTION_KEY || 'dev_key', 'hex');

  use(req: EncryptedRequest, res: Response, next: NextFunction) {
    if (req.body?.encryptedData) {
      try {
        const { iv, data } = req.body.encryptedData;
        const decipher = createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()]);
        req.body = JSON.parse(decrypted.toString());
      } catch {
        throw new BadRequestException('Invalid encrypted payload');
      }
    }
    next();
  }
}
