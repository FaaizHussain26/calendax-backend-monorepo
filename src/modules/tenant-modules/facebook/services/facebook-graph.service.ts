import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

export interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
}

export interface FacebookForm {
  id: string;
  name: string;
  status: string;
  createdTime: string;
}

@Injectable()
export class FacebookGraphService {
  private readonly logger = new Logger(FacebookGraphService.name);
  private readonly graphBaseUrl = 'https://graph.facebook.com/v19.0';

  async getPages(accessToken: string): Promise<FacebookPage[]> {
    try {
      const res = await fetch(
        `${this.graphBaseUrl}/me/accounts?access_token=${accessToken}&fields=id,name,access_token`,
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch Facebook pages', error);
      throw new InternalServerErrorException('Failed to fetch pages from Facebook.');
    }
  }

  async getFormsByPage(pageId: string, pageAccessToken: string): Promise<FacebookForm[]> {
    try {
      const res = await fetch(
        `${this.graphBaseUrl}/${pageId}/leadgen_forms?access_token=${pageAccessToken}&fields=id,name,status,created_time`,
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.data.map((f: any) => ({
        id: f.id,
        name: f.name,
        status: f.status,
        createdTime: f.created_time,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch forms for page ${pageId}`, error);
      throw new InternalServerErrorException('Failed to fetch forms from Facebook.');
    }
  }

  async subscribePageToWebhook(pageId: string, pageAccessToken: string): Promise<void> {
    try {
      const res = await fetch(`${this.graphBaseUrl}/${pageId}/subscribed_apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribed_fields: ['leadgen'],
          access_token: pageAccessToken,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
    } catch (error) {
      this.logger.error(`Failed to subscribe page ${pageId} to webhook`, error);
      throw new InternalServerErrorException('Failed to register Facebook webhook.');
    }
  }

  async getLeadData(leadId: string, accessToken: string): Promise<Record<string, string>> {
    try {
      const res = await fetch(
        `${this.graphBaseUrl}/${leadId}?access_token=${accessToken}&fields=field_data,created_time,form_id`,
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const fields: Record<string, string> = {};
      for (const field of data.field_data ?? []) {
        fields[field.name] = field.values?.[0] ?? '';
      }
      fields['formId'] = data.form_id;
      return fields;
    } catch (error) {
      this.logger.error(`Failed to fetch lead data for leadId ${leadId}`, error);
      throw new InternalServerErrorException('Failed to fetch lead data from Facebook.');
    }
  }
}