export type AllowedMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.ms-excel';

export interface UploadConfigOptions {
  destination: string;
  allowedTypes?: AllowedMimeType[];
  maxSizeMB?: number;
  fieldName?: string;
}