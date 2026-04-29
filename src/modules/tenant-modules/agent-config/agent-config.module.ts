import { Module } from '@nestjs/common';
import { AgentConfigService } from './agent-config.service';
import { AgentConfigController } from './agent-config.controller';
import { AgentConfigRepository } from './agent-config.repository';
import { provideTenantRepository } from '@libs/database/tenant-repository.helper';
import { AgentConfigEntity } from './agent-config.entity';
import { ElevenLabsModule } from '@libs/elevenlabs/elevenlabs.module';
import { InternalAgentConfigController } from './internal-agent-config.controller';

@Module({
  imports: [ElevenLabsModule],
  controllers: [AgentConfigController,InternalAgentConfigController],
  providers: [
    AgentConfigService,
    AgentConfigRepository,
    provideTenantRepository(AgentConfigEntity),
  ],
  exports: [AgentConfigService],
})
export class AgentConfigModule {}