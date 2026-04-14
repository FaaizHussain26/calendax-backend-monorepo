export interface ProcessDocumentOptions {
  protocolId: string;
  protocolNumber: string;
  siteIds: string[];
  indicationId?: string;
}

export interface DocumentChunk {
  text: string;
  embedding: number[];
  page: number;
  chunk: number;
  protocolId: string;
  siteIds: string[];
}
export interface ProcessDocumentResult {
  chunks: DocumentChunk[];
  totalPages: number;
  totalChunks: number;
}
export interface DocumentJobPayload {
  protocolId: string;
  filePath: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  siteIds: string[];
  indicationId?: string;
  tenantId: string;
}