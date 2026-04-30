// protocol.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ProtocolEntity } from './protocol.entity';
import { ProtocolRepository } from './protocol.repository';
import { ProtocolService } from './protocol.service';
import { ProtocolController } from './protocol.controller';
import { provideTenantRepository } from '../../../database/tenant/tenant-repository.helper';
import { TenantModule } from '../../tenant/tenant.module';
import { SiteModule } from '../site/site.module';
import { IndicationModule } from '../indication/indication.module';
import { DocumentModule } from '../../../services/doc/doc.module';
import { ProtocolDocumentMetaRepository } from './document/document-meta.repository';
import { DocumentProcessorService } from '../../../services/doc/document-processor.service';
import { ProtocolDocumentMetaEntity } from './document/document-meta.entity';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    TenantModule,
    IndicationModule,
    forwardRef(() => SiteModule),
    forwardRef(() => QuestionModule),
    DocumentModule,
  ],
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
