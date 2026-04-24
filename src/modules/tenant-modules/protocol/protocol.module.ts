// protocol.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ProtocolEntity } from './protocol.entity';
import { ProtocolRepository } from './protocol.repository';
import { ProtocolService } from './protocol.service';
import { ProtocolController } from './protocol.controller';
import { provideTenantRepository } from '@libs/database/tenant-repository.helper';
import { TenantModule } from '../../tenant/tenant.module';
import { SiteModule } from '../site/site.module';
import { IndicationModule } from '../indication/indication.module';
import { DocumentModule } from '../../../services/doc/doc.module';
import { ProtocolDocumentMetaRepository } from './document/document-meta.repository';
import { DocumentProcessorService } from '../../../services/doc/document-processor.service';
import { ProtocolDocumentMetaEntity } from './document/document-meta.entity';

@Module({
  imports: [TenantModule, IndicationModule, forwardRef(() => SiteModule), DocumentModule],
  providers: [
    ProtocolService,
    ProtocolRepository,
    ProtocolDocumentMetaRepository,
    DocumentProcessorService,
    provideTenantRepository(ProtocolEntity),
    provideTenantRepository(ProtocolDocumentMetaEntity), 
  ],
  controllers: [ProtocolController],
  exports: [ProtocolService, ProtocolRepository, ProtocolDocumentMetaRepository],
})
export class ProtocolModule {}
