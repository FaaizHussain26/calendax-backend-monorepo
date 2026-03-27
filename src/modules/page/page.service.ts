import { BadRequestException, Injectable } from "@nestjs/common";
import { PageRepository } from "./page.repository";
import { entityNotFound } from "src/utils/exceptions/notFound.exception";
import { CreatePageDto, PageResponseDto, UpdatePageDto } from "./page.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class PageService {
    constructor(
        private readonly pageRepository: PageRepository,
    ) {}

    async getAllPages() {
        try {
            return await this.pageRepository.getAllPages();
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async getPageById(id: string) {
        try {
            const page = await this.pageRepository.getByPageId(id);
            entityNotFound(page, "Page");
            return page;
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async createPage(payload: CreatePageDto) {
        try {
            const createdEntity = await this.pageRepository.createPage(payload);
            return plainToInstance(PageResponseDto, createdEntity);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async update(id: string, payload: UpdatePageDto) {
        try {
            const page = await this.pageRepository.getByPageId(id);
            entityNotFound(page, "Page");
            await this.pageRepository.updatePage(id, payload);
            const updatedEntity = await this.pageRepository.getByPageId(id);
            return plainToInstance(PageResponseDto, updatedEntity, {
                excludeExtraneousValues: true
            });
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async deletePage(id: string) {
        try {
            const page = await this.pageRepository.getByPageId(id);
            entityNotFound(page, "Page");
            await this.pageRepository.delete(id);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }
}