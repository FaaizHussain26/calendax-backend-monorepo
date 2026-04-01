// src/common/encryption/encryption.transformer.ts
import { ValueTransformer } from 'typeorm';
import { EncryptionUtil } from './encryption.util';

export const EncryptionTransformer: ValueTransformer = {
  to(value: any): string {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'string') {
      // ✅ guard against non-string values
      throw new Error(
        `EncryptionTransformer: expected string but got ${typeof value}`,
      );
    }
    return EncryptionUtil.encrypt(value);
  },

  from(value: string): string {
    if (!value) return value;
    return EncryptionUtil.decrypt(value);
  },
};