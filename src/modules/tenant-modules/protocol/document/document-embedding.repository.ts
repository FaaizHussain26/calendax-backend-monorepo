// protocol-document/protocol-document.repository.ts
import { Db } from 'mongodb';
import { BaseMongoRepository } from '../../../../database/base-mongo.repository';
import { IProtocolDocument, PROTOCOL_DOCUMENT_COLLECTION } from '../../../../common/interfaces/collections/protocol-document.interface';
import { DocumentChunk } from '../../../../common/interfaces/document.interface';

export class ProtocolDocumentRepository extends BaseMongoRepository<IProtocolDocument> {
  constructor(mongo: Db) {
    super(mongo, PROTOCOL_DOCUMENT_COLLECTION);
  }

  async insertChunks(chunks: DocumentChunk[]): Promise<void> {
    await this.insertMany(
      chunks.map((chunk) => ({
        text: chunk.text,
        embedding: chunk.embedding,
        page: chunk.page,
        chunk: chunk.chunk,
        protocol_id: chunk.protocolId,
        site_id: chunk.siteIds,
        file_id: chunk.protocolId,
      })),
    );
  }

  async findByProtocolId(protocolId: string): Promise<IProtocolDocument[]> {
    return this.findMany({ protocol_id: protocolId });
  }

  async deleteByProtocolIdAndFileId(protocolId: string,fileId:string): Promise<void> {
    await this.deleteMany({ protocol_id: protocolId,file_id:fileId });
  }
}