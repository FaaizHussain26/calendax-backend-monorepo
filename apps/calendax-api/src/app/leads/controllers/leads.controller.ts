import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LeadService } from "../services/lead.service";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { CreateLeadDto } from "../dtos/create-lead.dto";
import { UpdateLeadDto } from "../dtos/update-lead.dto";
// import { UserDecorator } from "../../utils/decorators/user.decorator";
// import { User } from "../../user/database/user.orm";

@Controller('v1/leads')
@ApiTags('leads')
export class LeadsController {
    constructor(
        private readonly leadService: LeadService,
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
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.leadService.getLead(id);
    }

    @Post('/')
    @HttpCode(201)
    @Permissions('lead.create')
    public create(
        @Body() createLeadDto: CreateLeadDto
    ) {
        const data = this.leadService.createLead(createLeadDto as any);
        return data;
    }

    @Put('/:id')
    @HttpCode(201)
    @Permissions('lead.update')
    public update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateLeadDto: UpdateLeadDto,
        // @UserDecorator() user: User
    ) {
        const data = this.leadService.updateLead(id, updateLeadDto);
        return data;
    }

    @Delete('/:id')
    @HttpCode(201)
    @Permissions('lead.delete')
    public delete(
        @Param('id', ParseIntPipe) id: number,
        // @UserDecorator() user: User
    ) {
        const data = this.leadService.deleteLead(id);
        return data;
    }
}