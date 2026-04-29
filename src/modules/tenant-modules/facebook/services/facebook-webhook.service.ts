import { Injectable, Logger } from '@nestjs/common';
import { FacebookFormService } from './facebook-form.service';
import { FacebookConfigService } from './facebook-config.service';
import { FacebookGraphService } from './facebook-graph.service';

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

    this.logger.log(
      `Lead received — formId: ${formId} · protocolId: ${formConnection.protocolId}`,
    );

    /**
     * TODO: inject LeadService once Lead module is built
     * await this.leadService.createFromFacebook({
     *   facebookFormId: formConnection.id,
     *   protocolId: formConnection.protocolId,
     *   callingConfigId: formConnection.callingConfigId,
     *   firstName: fieldData['first_name'],
     *   lastName: fieldData['last_name'],
     *   phone: fieldData['phone_number'],
     *   email: fieldData['email'],
     * });
     */
  }
}