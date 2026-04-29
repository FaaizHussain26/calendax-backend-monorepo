import {
  Injectable,
  Logger,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

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

  /**
   * Verifies the user access token works and returns pages.
   * Called during upsert to validate before saving.
   */
  async verifyUserToken(userAccessToken: string): Promise<void> {
    try {
      const res = await fetch(
        `${this.graphBaseUrl}/me/accounts?access_token=${userAccessToken}&fields=id,name`,
      );
      const data = await res.json();
      if (data.error) {
        throw new UnauthorizedException(
          `Invalid user access token: ${data.error.message}`,
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Failed to verify user access token', error);
      throw new InternalServerErrorException('Failed to connect to Facebook.');
    }
  }

  /**
   * Fetches all pages the user has access to.
   * Requires a user access token — tenant provides this directly.
   */
  async getPages(userAccessToken: string): Promise<FacebookPage[]> {
    try {
      const res = await fetch(
        `${this.graphBaseUrl}/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token`,
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

  /**
   * Fetches all lead gen forms for a given page.
   * Uses the page-specific access token returned from getPages.
   */
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

  /**
   * Subscribes a page to leadgen webhook events.
   * Called when a form is connected.
   */
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

  /**
   * Fetches a single lead's field data after webhook fires.
   */
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