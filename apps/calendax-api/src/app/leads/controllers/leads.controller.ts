import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LeadService } from "../services/lead.service";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { CreateLeadDto } from "../dtos/create-lead.dto";
import { UpdateLeadDto } from "../dtos/update-lead.dto";
import { skipAuth } from "../../utils/decorators/skip-auth.decorator";
// import { UserDecorator } from "../../utils/decorators/user.decorator";
// import { User } from "../../user/database/user.orm";

@Controller('v1/leads')
@ApiTags('leads')
export class LeadsController {
    constructor(
        private readonly leadService: LeadService,
    ) {}

    @ApiPaginationQueries([
        {
            name: 'eventId',
            type: Number,
            description: 'Event Id',
            required: false,
        }
    ])
    @Get('/')
    @Permissions('lead.view')
    @skipAuth()
    async getLeads(
        @PaginationParams() pagination: PaginationRequest
    ) {
        const data = await this.leadService.getLeads(pagination);
        return data;
    }

    @Get('/:id')
    @Permissions('lead.view')
    @HttpCode(200)
    @skipAuth()
    public getLead(
        @Param('id') id: number
    ) {
        return this.leadService.getLead(id);
    }

    @Post('/')
    @HttpCode(201)
    @Permissions('lead.create')
    @skipAuth()
    public create(
        @Body() createLeadDto: CreateLeadDto
    ) {
        const data = this.leadService.createLead(createLeadDto as any);
        return data;
    }

    @Put('/:id')
    @HttpCode(201)
    @Permissions('lead.update')
    @skipAuth()
    public update(
        @Param('id') id: number,
        @Body() updateLeadDto: UpdateLeadDto,
        // @UserDecorator() user: User
    ) {
        const data = this.leadService.updateLead(id, updateLeadDto);
        return data;
    }

    @Delete('/:id')
    @HttpCode(201)
    @Permissions('lead.delete')
    @skipAuth()
    public delete(
        @Param('id') id: number,
        // @UserDecorator() user: User
    ) {
        const data = this.leadService.deleteLead(id);
        return data;
    }
}