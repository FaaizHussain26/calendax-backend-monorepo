import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalApiClient {
  private readonly logger = new Logger(InternalApiClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('internal.apiUrl');
    this.apiKey = this.config.get<string>('internal.apiKey');
  }

  private get baseHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-internal-api-key': this.apiKey,
    };
  }

  private tenantHeaders(tenantId: string) {
    return {
      ...this.baseHeaders,
      'x-tenant-id': tenantId,
    };
  }

  private async request<T>(
    url: string,
    tenantId: string,
    label: string,
  ): Promise<T> {
    try {
      const res = await fetch(url, {
        headers: this.tenantHeaders(tenantId),
      });

      if (res.status === 404) {
        throw new NotFoundException(`${label} not found.`);
      }

      if (!res.ok) {
        throw new InternalServerErrorException(
          `Internal API error [${label}]: ${res.status}`,
        );
      }

      return res.json();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error(`Failed to fetch ${label}`, error);
      throw new InternalServerErrorException(
        `Failed to reach internal API for ${label}. Is main-api running?`,
      );
    }
  }

  async getTenantById(tenantId: string) {
    return this.request<any>(
      `${this.baseUrl}/internal/tenants/${tenantId}`,
      tenantId,
      `tenant ${tenantId}`,
    );
  }

  async getCallingConfig(
    callingConfigId: string,
    tenantId: string,
  )  {
    return this.request(
      `${this.baseUrl}/internal/calling-configs/${callingConfigId}`,
      tenantId,
      `calling config ${callingConfigId}`,
    );
  }

  async getPendingLeads(
    callingConfigId: string,
    limit: number,
    tenantId: string,
  ) {
    return this.request(
      `${this.baseUrl}/internal/leads/pending?callingConfigId=${callingConfigId}&limit=${limit}`,
      tenantId,
      `pending leads for config ${callingConfigId}`,
    );
  }

  async updateLeadStatus(
    leadId: string,
    status: string,
    tenantId: string,
  ): Promise<void> {
    try {
      const res = await fetch(
        `${this.baseUrl}/internal/leads/${leadId}/status`,
        {
          method: 'PATCH',
          headers: this.tenantHeaders(tenantId),
          body: JSON.stringify({ status }),
        },
      );
      if (!res.ok) {
        throw new InternalServerErrorException(
          `Failed to update lead status: ${res.status}`,
        );
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(`Failed to update lead ${leadId} status`, error);
      throw new InternalServerErrorException('Failed to update lead status.');
    }
  }

  async saveTranscript(
    leadId: string,
    transcript: string,
    tenantId: string,
  ): Promise<void> {
    try {
      const res = await fetch(
        `${this.baseUrl}/internal/leads/${leadId}/transcript`,
        {
          method: 'PATCH',
          headers: this.tenantHeaders(tenantId),
          body: JSON.stringify({ transcript }),
        },
      );
      if (!res.ok) {
        throw new InternalServerErrorException(
          `Failed to save transcript: ${res.status}`,
        );
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(`Failed to save transcript for lead ${leadId}`, error);
      throw new InternalServerErrorException('Failed to save transcript.');
    }
  }
}