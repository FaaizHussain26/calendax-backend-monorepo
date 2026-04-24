import { Injectable, Logger } from '@nestjs/common';
import { FacebookFormService } from './facebook-form.service';
import { FacebookGraphService } from './facebook-graph.service';
import { FacebookConfigService } from './facebook-config.service';
import { LeadService } from '../../lead/lead.service';

export interface IncomingLeadPayload {
  leadgenId: string;
  formId: string;
  pageId: string;
}

@Injectable()
export class FacebookWebhookService {
  private readonly logger = new Logger(FacebookWebhookService.name);

  constructor(
    private readonly formService: FacebookFormService,
    private readonly graphService: FacebookGraphService,
    private readonly fbConfigService: FacebookConfigService,
    private readonly leadService: LeadService,
  ) {}

  async processLead(payload: IncomingLeadPayload): Promise<void> {
    const { leadgenId, formId } = payload;

    const formConnection = await this.formService.findByFormId(formId);
    if (!formConnection) {
      this.logger.warn(`Received lead for unconnected formId: ${formId} — skipping.`);
      return;
    }

    const fbConfig = await this.fbConfigService.get();
    const fieldData = await this.graphService.getLeadData(leadgenId, fbConfig.accessToken!);

    await this.leadService.createFromFacebook({
      facebookFormId: formConnection.id,
      protocolId: formConnection.protocolId,
      callingConfigId: formConnection.callingConfigId!,//temporary
      firstName: fieldData['first_name'] ?? '',
      lastName: fieldData['last_name'] ?? '',
      phone: fieldData['phone_number'] ?? '',
      email: fieldData['email'] ?? null,
    });

    this.logger.log(`Lead created from Facebook — formId: ${formId}`);
  }
}