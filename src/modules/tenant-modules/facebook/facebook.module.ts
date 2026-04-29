import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FacebookConfigEntity } from './entities/facebook-config.entity';
import { FacebookFormEntity } from './entities/facebook-form.entity';

import { FacebookConfigRepository } from './repositories/facebook-config.repository';
import { FacebookFormRepository } from './repositories/facebook-form.repository';

import { FacebookConfigService } from './services/facebook-config.service';
import { FacebookWebhookService } from './services/facebook-webhook.service';

import { FacebookConfigController } from './controllers/facebook-config.controller';
import { FacebookFormController } from './controllers/facebook-form.controller';
import { FacebookWebhookController } from './controllers/facebook-webhook.controller';

import { provideTenantRepository } from '../../../database/tenant/tenant-repository.helper';
import { FacebookGraphService } from './services/facebook-graph.service';
import { FacebookFormService } from './services/facebook-form.service';

@Module({
  imports: [ConfigModule],
  controllers: [
    FacebookConfigController,
    FacebookFormController,
    FacebookWebhookController,
  ],
  providers: [
    FacebookConfigService,
    FacebookFormService,
    FacebookGraphService,
    FacebookWebhookService,
    FacebookConfigRepository,
    FacebookFormRepository,
    provideTenantRepository(FacebookConfigEntity),
    provideTenantRepository(FacebookFormEntity),
  ],
  exports: [FacebookFormService, FacebookConfigService],
})
export class FacebookModule {}