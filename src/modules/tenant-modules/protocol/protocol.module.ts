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

@Module({
  imports: [TenantModule, IndicationModule, forwardRef(() => SiteModule)],
  providers: [ProtocolService, ProtocolRepository, provideTenantRepository(ProtocolEntity)],
  controllers: [ProtocolController],
  exports: [ProtocolService, ProtocolRepository],
})
export class ProtocolModule {}
