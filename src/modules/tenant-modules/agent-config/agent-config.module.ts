import { Module } from '@nestjs/common';
import { AgentConfigService } from './agent-config.service';
import { AgentConfigController } from './agent-config.controller';
import { AgentConfigRepository } from './agent-config.repository';
import { provideTenantRepository } from '../../../database/tenant/tenant-repository.helper';
import { AgentConfigEntity } from './agent-config.entity';
import { ElevenLabsModule } from '../../../services/elevenlabs/elevenlabs.module';

@Module({
  imports: [ElevenLabsModule],
  controllers: [AgentConfigController],
  providers: [
    AgentConfigService,
    AgentConfigRepository,
    provideTenantRepository(AgentConfigEntity),
  ],
  exports: [AgentConfigService],
})
export class AgentConfigModule {}