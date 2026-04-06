import { Injectable } from '@nestjs/common';
import { randomBytes, createHmac } from 'crypto';
import { UserEntity } from '../../modules/tenant-modules/user/user.entity';
const expiryMap: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
  y: 60 * 60 * 24 * 365,
};
@Injectable()
export class HelperFunctions {
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\_]+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  static parseBool = (val: boolean | string): boolean => val === true || val === 'true';

  static generateSecurePassword(length = 32): string {
    return randomBytes(length).toString('base64url').slice(0, length);
  }

  // --- Searchable Encryption Helpers ---

  private static generateNgrams(text: string, n = 3): string[] {
    const normalized = text.toLowerCase().trim();
    const ngrams: string[] = [];
    for (let i = 0; i <= normalized.length - n; i++) {
      ngrams.push(normalized.slice(i, i + n));
    }
    return ngrams;
  }

  private static hashNgram(ngram: string): string {
    return createHmac('sha256', process.env.NGRAM_PEPPER_SECRET || 'dev_secret')
      .update(ngram)
      .digest('hex');
  }

  static buildSearchIndex(name: string, email: string): string[] {
    const combined = `${name} ${email}`.toLowerCase();
    return [...new Set(HelperFunctions.generateNgrams(combined).map(HelperFunctions.hashNgram))];
  }

  static parseExpiryToSeconds(value: string | number): number {
    if (typeof value === 'number') return value;
    const unit = value.slice(-1);
    const amount = parseInt(value.slice(0, -1), 10);
    return amount * (expiryMap[unit] ?? 1);
  }
  static resolvePermissions(user: UserEntity): string[] {
    const fromRole = user.role?.permissions?.map((p) => p.key) ?? [];
    const direct = user.permissions?.map((p) => p.key) ?? [];

    // merge + deduplicate
    return [...new Set([...fromRole, ...direct])];
  }
}
