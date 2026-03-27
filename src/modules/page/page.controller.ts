import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { PageService } from "./page.service";
import { CreatePageDto, UpdatePageDto } from "./page.dto";

@Controller("/page")
export class PageController {
    constructor(
        private readonly pageService: PageService
    ) {}

    @Get("/")
    async getAllPages() {
        return await this.pageService.getAllPages();
    }

    @Get("/:id")
    async getpagesById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.pageService.getPageById(id);
    }

    @Post("/")
    async createPage(@Body() payload: CreatePageDto) {
        return await this.pageService.createPage(payload);
    }

    @Patch("/:id")
    async updatePage(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() payload: UpdatePageDto
    ) {
        return await this.pageService.update(id, payload);
    }

    @Delete("/:id")
    async deletePage(@Param('id', ParseUUIDPipe) id: string) {
        await this.pageService.deletePage(id);
        return { message: "Page deleted successfully" };
    }
}