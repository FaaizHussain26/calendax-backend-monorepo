import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FacebookFormEntity } from '../entities/facebook-form.entity';
import { ConnectFormDto, UpdateFormConnectionDto } from '../dto/facebook-form.dto';
import { FacebookFormRepository } from '../repositories/facebook-form.repository';
import { FacebookGraphService } from './facebook-graph.service';
import { FacebookConfigService } from './facebook-config.service';

export interface FacebookPageWithForms {
  id: string;
  name: string;
  forms: Array<{
    id: string;
    name: string;
    status: string;
    createdTime: string;
    isConnected: boolean;
    connection: FacebookFormEntity | null;
  }>;
}

@Injectable()
export class FacebookFormService {
  constructor(
    private readonly repo: FacebookFormRepository,
    private readonly graphService: FacebookGraphService,
    private readonly fbConfigService: FacebookConfigService,
  ) {}

  async getPagesWithForms(): Promise<FacebookPageWithForms[]> {
    const fbConfig = await this.fbConfigService.get();
    const pages = await this.graphService.getPages(fbConfig.accessToken!);
    const result: FacebookPageWithForms[] = [];

    for (const page of pages) {
      const fbForms = await this.graphService.getFormsByPage(page.id, page.accessToken);
      const formIds = fbForms.map((f) => f.id);
      const connectedForms = await this.repo.findByFormIds(formIds);
      const connectedMap = new Map(connectedForms.map((f) => [f.formId, f]));

      result.push({
        id: page.id,
        name: page.name,
        forms: fbForms.map((f) => ({
          id: f.id,
          name: f.name,
          status: f.status,
          createdTime: f.createdTime,
          isConnected: connectedMap.has(f.id),
          connection: connectedMap.get(f.id) ?? null,
        })),
      });
    }

    return result;
  }

  async connect(dto: ConnectFormDto): Promise<FacebookFormEntity> {
    const existing = await this.repo.findByFormId(dto.formId);
    if (existing) {
      throw new ConflictException(
        `Form ${dto.formId} is already connected. Use PATCH to update.`,
      );
    }

    const fbConfig = await this.fbConfigService.get();
    const pages = await this.graphService.getPages(fbConfig.accessToken!);
    const page = pages.find((p) => p.id === dto.pageId);
    if (page) {
      await this.graphService.subscribePageToWebhook(page.id, page.accessToken);
    }

    return this.repo.save(this.repo.create(dto));
  }

  async updateConnection(id: string, dto: UpdateFormConnectionDto): Promise<FacebookFormEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Form connection not found.');
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async disconnect(id: string): Promise<{ message: string }> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Form connection not found.');
    await this.repo.remove(existing);
    return { message: 'Form disconnected successfully.' };
  }

  async findByFormId(formId: string): Promise<FacebookFormEntity | null> {
    return this.repo.findByFormId(formId);
  }
}