import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadConfigOptions } from '../interfaces/upload.interface';
import { createUploadConfig } from '../../services/upload/upload.config';

export function UploadFile(options: UploadConfigOptions) {
  const { fieldName = 'file' } = options;
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, createUploadConfig(options)),
    ),
  );
}

export function UploadFiles(options: UploadConfigOptions & { maxCount?: number }) {
  const { fieldName = 'files', maxCount = 5 } = options;
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, createUploadConfig(options)),
    ),
  );
}