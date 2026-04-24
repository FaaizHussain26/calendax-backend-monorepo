import { Request } from 'express';

interface EncryptedPayload {
  iv: string;
  data: string;
}

export interface EncryptedRequest extends Request {
  body: {
    encryptedData?: EncryptedPayload;
    [key: string]: unknown; // allows req.body to hold any parsed fields after decryption
  };
}
