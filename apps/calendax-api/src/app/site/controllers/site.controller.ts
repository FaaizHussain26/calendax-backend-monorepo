import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import { SiteService } from "../services/site.service";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { SiteIds } from "../../utils/decorators/site-ids.decorator";
import { isAdmin } from "../../utils/decorators/is-admin.decorator";
import { CreateSiteDto } from "../dtos/create-site.dto";
import { UserDecorator } from "../../utils/decorators/user.decorator";
import { User } from "../../user/database/user.orm";

@Controller("v1/sites")
export class SiteController {
    constructor(
        private readonly siteService: SiteService,
    ) {}

    @Get("/get_listing")
    @Permissions("site.view")
    @HttpCode(200)
    async getSitesListing(): Promise<any> {
        return await this.siteService.getList({
            query: "",
        });
    }

    @ApiPaginationQueries([
        {
            name: "eventIds",
            type: [Number],
            required: false,
            description: "Filter by event Ids",
        },
    ])
    @Get("/")
    @Permissions("site.view")
    public getSites(
        @PaginationParams() pagination: PaginationRequest,
        @SiteIds() siteIds: number[],
        @isAdmin() isAdmin: boolean,
    ) {
        const data = this.siteService.getSites(
            pagination, siteIds, isAdmin
        );
        return data;
    }

    @Get("/:id")
    @Permissions("site.view")
    @HttpCode(200)
    public getSite(@Param("id") id: number) {
        return this.siteService.getSitesById(id);
    }


    @Post("/")
    @Permissions("site.add")
    @HttpCode(201)
    public create(
        @Body() createSiteDto: CreateSiteDto,
        @UserDecorator() user: User,
    ) {
        return this.siteService.createSites(createSiteDto);
    }


    @Put("/:id")
    @Permissions("site.update")
    @HttpCode(201)
    public update(
        @Param("id") id: number,
        @Body() updateSiteDto: CreateSiteDto,
        @UserDecorator() user: User,
    ) {
        return this.siteService.updateSites(id, updateSiteDto);
    }

    @Delete("/:id")
    @Permissions("site.delete")
    @HttpCode(201)
    public delete(
        @Param("id") id: number,
        @UserDecorator() user: User,
    ) {
        return this.siteService.deleteSite(id);
    }
}