import * as fs from 'fs';
import { Logger } from '@nestjs/common';

const logger = new Logger('UploadHelper');

export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.log(`Deleted temp file: ${filePath}`);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Failed to delete file: ${filePath} — ${err.message}`);
  }
}

export function ensureUploadDirExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.log(`Created upload directory: ${dir}`);
  }
}