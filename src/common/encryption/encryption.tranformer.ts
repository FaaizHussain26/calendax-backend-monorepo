// encryption.transformer.ts
import { ValueTransformer } from 'typeorm';
import { EncryptionUtil } from './encryption.util';

export const EncryptionTransformer: ValueTransformer = {
  to: (value?: string) => {
    if (!value) return value;
    return EncryptionUtil.encrypt(value);
  },

  from: (value?: string) => {
    if (!value) return value;
    return EncryptionUtil.decrypt(value);
  },
};