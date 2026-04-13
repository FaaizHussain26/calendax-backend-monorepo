import { Module, forwardRef } from '@nestjs/common';
import { QuestionEntity } from './question.entity';
import { QuestionRepository } from './question.repository';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { provideTenantRepository } from '../../../database/tenant/tenant-repository.helper';
import { TenantModule } from '../../tenant/tenant.module';
import { ProtocolModule } from '../protocol/protocol.module';
import { ProtocolDocumentMetaEntity } from '../protocol/document/document-meta.entity';
import { ProtocolDocumentMetaRepository } from '../protocol/document/document-meta.repository';

@Module({
  imports: [
    TenantModule,
    forwardRef(() => ProtocolModule),
  ],
  providers: [
    QuestionService,
    QuestionRepository,
    ProtocolDocumentMetaRepository,
    provideTenantRepository(QuestionEntity),
    provideTenantRepository(ProtocolDocumentMetaEntity),
  ],
  controllers: [QuestionController],
  exports: [QuestionService, QuestionRepository],
})
export class QuestionModule {}