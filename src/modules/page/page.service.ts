import { BadRequestException, Injectable } from "@nestjs/common";
import { PageRepository } from "./page.repository";

import { CreatePageDto, PageResponseDto, UpdatePageDto } from "./page.dto";
import { plainToInstance } from "class-transformer";
import { entityNotFound } from "../../common/exceptions/notFound.exception";

@Injectable()
export class PageService {
    constructor(
        private readonly pageRepository: PageRepository,
    ) {}

    async getAllPages() {
        try {
            return await this.pageRepository.getAllPages();
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async getPageById(id: string) {
        try {
            const page = await this.pageRepository.getByPageId(id);
            entityNotFound(page, "Page");
            return page;
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async createPage(payload: CreatePageDto) {
        try {
            const createdEntity = await this.pageRepository.createPage(payload);
            return plainToInstance(PageResponseDto, createdEntity);
        }catch(error:any) {
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
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async deletePage(id: string) {
        try {
            const page = await this.pageRepository.getByPageId(id);
            entityNotFound(page, "Page");
            await this.pageRepository.delete(id);
             return { message: "Page deleted successfully" };
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }
}