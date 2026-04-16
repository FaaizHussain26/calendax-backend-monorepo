import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class AppService {
  private cached: Record<string, Record<string, string>> | null = null;

  getHello(): string {
    return 'Hello World!';
  }
getAllEnums(): Record<string, Record<string, string>> {
  if (this.cached) return this.cached;

  const enumsDir = path.join(process.cwd(), 'dist/common/enums');
  const result: Record<string, Record<string, string>> = {};

  const files = fs
    .readdirSync(enumsDir)
    .filter((f) => f.endsWith('.enum.js'));

  console.log('Loading enums from:', enumsDir, files);

  for (const file of files) {
    const mod = require(path.join(enumsDir, file));

    for (const [exportName, value] of Object.entries(mod)) {
      if (this.isEnum(value)) {
        result[exportName] = value as Record<string, string>;
      }
    }
  }

  this.cached = result;
  return result;
}
  private isEnum(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.values(value).every((v) => typeof v === 'string')
    );
  }
}
