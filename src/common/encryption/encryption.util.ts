// encryption.util.ts
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export class EncryptionUtil {
  private static getKey() {
    return crypto
      .createHash('sha256')
      .update(process.env.DB_ENCRYPTION_KEY || 'dev_encryption_key')
      .digest();
  }

  static encrypt(value: string): string {
    if (!value) return value;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.getKey(), iv);

    let encrypted = cipher.update(value, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return `${iv.toString('base64')}:${encrypted}`;
  }

  static decrypt(value: string): string {
    if (!value) return value;

    const [ivBase64, encrypted] = value.split(':');

    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.getKey(), iv);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
