import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PageRepository } from './page.repository';

import { CreatePageDto, PageResponseDto, UpdatePageDto, UpdatePageIndexDto } from './page.dto';
import { plainToInstance } from 'class-transformer';
import { entityNotFound } from '@libs/common/exceptions/notFound.exception';
import { PaginationDto } from '@libs/common/dto/pagination.dto';
import { HelperFunctions } from '@libs/common/utils/functions';

@Injectable()
export class PageService {
  constructor(private readonly pageRepository: PageRepository) {}

  async findAllPages(query: PaginationDto) {
    return await this.pageRepository.findAllPages(query);
  }

  async getPageById(id: string) {
    const page = await this.pageRepository.findByPageId(id);
    entityNotFound(page, 'Page');
    return page;
  }

  async createPage(dto: CreatePageDto) {
    const slug = HelperFunctions.generateSlug(dto.name);
    const prev = await this.pageRepository.findBySlug(slug);
    if (prev) throw new ConflictException('Page with this name already exists!');
    const payload = { ...dto, slug, href: dto.href ?? `/${slug}` };
    const createdEntity = await this.pageRepository.createPage(payload);
    return createdEntity;
  }

  async update(id: string, payload: UpdatePageDto) {
    const page = await this.pageRepository.findByPageId(id);
    entityNotFound(page, 'Page');
    await this.pageRepository.updatePage(id, payload);
    const updatedEntity = await this.pageRepository.findByPageId(id);
    return updatedEntity;
  }

  async updatePageByIndex(pageId: string, payload: UpdatePageIndexDto) {
    const maxIndex = Number(await this.pageRepository.maxIndex());
    const page = await this.pageRepository.findByPageId(pageId);
    if (!page) {
      throw new BadRequestException('Page with this index does not exist!');
    }
    const currentIndex = page.index;

    if (payload.newIndex < 1 || payload.newIndex > maxIndex) {
      throw new BadRequestException('Requested IndexNumber is not acceptable');
    }

    if (payload.newIndex === currentIndex) {
      return { message: 'index numbers updated' };
    }

    await this.pageRepository.updatePage(pageId, { index: -1 });

    if (payload.newIndex > currentIndex) {
      for (let i = currentIndex + 1; i <= payload.newIndex; i++) {
        await this.pageRepository.updateindex(i, { index: i - 1 });
      }
    } else {
      for (let i = currentIndex - 1; i >= payload.newIndex; i--) {
        await this.pageRepository.updateindex(i, { index: i + 1 });
      }
    }

    await this.pageRepository.updatePage(pageId, { index: payload.newIndex });
    return { message: 'index numbers updated' };
  }

  async deletePage(id: string) {
    const page = await this.pageRepository.findByPageId(id);
    entityNotFound(page, 'Page');
    await this.pageRepository.delete(id);
    return { message: 'Page deleted successfully' };
  }
}
