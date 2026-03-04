import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PermissionGroupService } from "../services/permission-group.service";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { ApiPaginatedResponse, PaginationParams } from "../../utils/pagination/decorators";
import { skipAuth } from "../../utils/decorators/skip-auth.decorator";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { PermissionGroupResponseDto } from "../dtos/permission-group-response.dto";
import { CreatePermissionGroupRequestDto } from "../dtos/create-permission-group-response.dto";
import { UpdatePermissionGroupRequestDto } from "../dtos/update-permission-group-response.dto";

@ApiTags('Permission Group')
@ApiBearerAuth()
@Controller({
    path: 'permission-groups',
    version: '1',
})
export class PermissionGroupController {
    constructor(
        private readonly permissionGroupService: PermissionGroupService,
    ) {}

    @Get('/')
    @Permissions('permission-group.view')
    @ApiPaginatedResponse(PermissionGroupResponseDto)
    @skipAuth()
    public getPermissionGroups(
        @PaginationParams() pagination: PaginationRequest
    ) {
        return this.permissionGroupService.getPermissionGroups(pagination);
    }

    @Get('/:id')
    @Permissions('permission-group.view')
    @skipAuth()
    public getPermissionGroupById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.permissionGroupService.getPermissionGroupById(id);
    }

    @Post('/')
    @Permissions('permission-group.create')
    @skipAuth()
    public createPermissionGroup(
        @Body(ValidationPipe) permissionGroupDto: CreatePermissionGroupRequestDto,
    ) {
        return this.permissionGroupService.createPermissionGroup(permissionGroupDto);
    }

    @Put('/:id')
    @Permissions('permission-group.update')
    @skipAuth()
    public updatePermissionGroup(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) permissionGroupDto: UpdatePermissionGroupRequestDto
    ) {
        return this.permissionGroupService.updatePermissionGroup(id, permissionGroupDto);
    }

    @Delete('/:id')
    @Permissions('permission-group.delete')
    @skipAuth()
    public deletePermissionGroup(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.permissionGroupService.deletePermissionGroup(id);
    }
}