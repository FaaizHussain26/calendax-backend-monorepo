import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PageEntity } from "./page.entity";
import { Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { PageResponseDto } from "./page.dto";

@Injectable()
export class PageRepository {
    constructor(
        @InjectRepository(PageEntity)
        private readonly pageRepository: Repository<PageEntity>,
    ) {}

    async getAllPages() {
        const pages = await this.pageRepository.find();
        return plainToInstance(PageResponseDto, pages);
    }

    async getByPageId(id: string) {
        return await this.pageRepository.findOne({
            where: { id: id },
        });
    }

    async createPage(payload: Partial<PageEntity>) {
        const createdEntity = this.pageRepository.create(payload);
        return await this.pageRepository.save(createdEntity);
    }

    async updatePage(id: string, payload: Partial<PageEntity>) {
        const updatedEntity = this.pageRepository.update(id, payload);
        return updatedEntity;
    }

    async delete(id: string) {
        return await this.pageRepository.delete(id);
    }
}