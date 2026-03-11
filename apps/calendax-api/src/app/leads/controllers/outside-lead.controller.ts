import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { skipAuth } from "../../utils/decorators/skip-auth.decorator";
import { OutSideLeadService } from "../services/outside-lead.service";
import { CreateOutsideLeadDto } from "../dtos/create-outside-lead.dto";
import { UpdateOutSideLeadDto } from "../dtos/update-outsidelead.dto";
// import { UserDecorator } from "../../utils/decorators/user.decorator";
// import { User } from "../../user/database/user.orm";

@Controller('v1/outside-leads')
@ApiTags('outside-leads')
export class OutSideLeadsController {
    constructor(
        private readonly leadService: OutSideLeadService,
    ) {}

    @ApiPaginationQueries([])
    @Get('/')
    @Permissions('lead.view')
    async getLeads(
        @PaginationParams() pagination: PaginationRequest
    ) {
        const data = await this.leadService.getLeads(pagination);
        return data;
    }

    @Get('/:id')
    @Permissions('lead.view')
    @HttpCode(200)
    public getLead(
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.leadService.getLead(id);
    }

    @Post('/')
    @HttpCode(201)
    @Permissions('lead.create')
    public create(
        @Body() createLeadDto: CreateOutsideLeadDto
    ) {
        const data = this.leadService.createLead(createLeadDto);
        return data;
    }

    @Put('/:id')
    @HttpCode(201)
    @Permissions('lead.update')
    public update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateLeadDto: UpdateOutSideLeadDto,
        // @UserDecorator() user: User
    ) {
        const data = this.leadService.updateLead(id, updateLeadDto);
        return data;
    }

    @Delete('/:id')
    @HttpCode(201)
    @Permissions('lead.delete')
    public delete(
        @Param('id', ParseUUIDPipe) id: string,
        // @UserDecorator() user: User
    ) {
        const data = this.leadService.deleteLead(id);
        return data;
    }
}