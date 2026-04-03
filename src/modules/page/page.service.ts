import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PageRepository } from './page.repository';

import { CreatePageDto, PageResponseDto, UpdatePageDto } from './page.dto';
import { plainToInstance } from 'class-transformer';
import { entityNotFound } from '../../common/exceptions/notFound.exception';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { HelperFunctions } from '../../common/utils/functions';
import type { RequestWithUser } from '../../common/interface/request-with-user';

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
      const prev=await this.pageRepository.findBySlug(slug)
      if(prev) throw new ConflictException("Page with this name already exists!")
      const payload = { ...dto, slug, href: dto.href ?? `/${slug}` };
      const createdEntity = await this.pageRepository.createPage(payload);
      return plainToInstance(PageResponseDto, createdEntity);
  
  }

  async update(id: string, payload: UpdatePageDto) {
    
      const page = await this.pageRepository.findByPageId(id);
      entityNotFound(page, 'Page');
      await this.pageRepository.updatePage(id, payload);
      const updatedEntity = await this.pageRepository.findByPageId(id);
      return plainToInstance(PageResponseDto, updatedEntity, {
        excludeExtraneousValues: true,
      });
  
  }

  async deletePage(id: string) {
    
      const page = await this.pageRepository.findByPageId(id);
      entityNotFound(page, 'Page');
      await this.pageRepository.delete(id);
      return { message: 'Page deleted successfully' };
  
  }
}
