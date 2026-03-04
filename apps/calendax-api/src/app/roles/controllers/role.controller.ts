import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { RoleService } from "../services/role.service";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { RoleResponseDto } from "../dtos/role-response.dto";
import { CreateRoleRequestDto } from "../dtos/create-role-dto";
import { UpdateRoleRequestDto } from "../dtos/update-role.dto";
import { skipAuth } from "../../utils/decorators/skip-auth.decorator";

@ApiTags('Roles')
@ApiBearerAuth()
@Controller({
    path: 'roles',
    version: '1'
})
export class RoleController {
    constructor(
        private readonly roleService: RoleService
    ) {}

    @Get('/')
    @Permissions()
    @ApiPaginationQueries([])
    @skipAuth()
    public getRoles(
        @PaginationParams() pagination: PaginationRequest
    ) {
        return this.roleService.getRoles(pagination);
    }

    @Get('/:id')
    @Permissions('role.view')
    @skipAuth()
    public getRoleById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<RoleResponseDto> {
        return this.roleService.getRoleById(id);
    }

    @Post('/')
    @Permissions('role.add')
    @skipAuth()
    public createRole(
        @Body(ValidationPipe) roleDto: CreateRoleRequestDto
    ) {
        return this.roleService.createRole(roleDto);
    }

    @Put('/:id')
    @Permissions('role.update')
    @skipAuth()
    public updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) roleDto: UpdateRoleRequestDto
    ) {
        return this.roleService.updateRole(id, roleDto);
    }

    @Delete('/:id')
    @Permissions('role.delete')
    @skipAuth()
    public deleteUser(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.roleService.deleteRole(id); 
    }
}