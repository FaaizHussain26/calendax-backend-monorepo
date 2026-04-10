// protocol-document/protocol-document.interface.ts

import { BaseMongoDocument } from "../mongo.interface";

export const PROTOCOL_DOCUMENT_COLLECTION = 'protocol_documents';

export interface IProtocolDocument extends BaseMongoDocument {
  text: string;
  embedding: number[];
  page: number;
  chunk: number;
  protocol_id: string;
  site_id: string[];
  file_id: string;
}