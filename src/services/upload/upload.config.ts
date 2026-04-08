import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AllowedMimeType, UploadConfigOptions } from '../../common/interfaces/upload.interface';




export function createUploadConfig(options: UploadConfigOptions) {
  const {
    destination,
    allowedTypes = ['application/pdf'],
    maxSizeMB = 10,
  } = options;

  return {
    storage: diskStorage({
      destination: `./${destination}`,
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req: Express.Request, file: Express.Multer.File, cb: Function) => {
      if (!allowedTypes.includes(file.mimetype as AllowedMimeType)) {
        return cb(
          new BadRequestException(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`),
          false,
        );
      }
      cb(null, true);
    },
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  };
}