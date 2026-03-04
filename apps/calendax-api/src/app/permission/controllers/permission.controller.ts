import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PermissionService } from "../services/permission.service";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { CreatePermissionRequestDto } from "../dtos/create-permission-request.dto";
import { UpdatePermissionRequestDto } from "../dtos/update-permission-request.dto";

@ApiTags("Permissions")
@ApiBearerAuth()
@Controller({
    path: "permissions",
    version: "1",
})
export class PermissionController {
    constructor (
        private readonly permissionService: PermissionService
    ) {}

    @Get("/")
    @Permissions("permission.view")
    @ApiPaginationQueries([])
    public getPermissions(
        @PaginationParams() pagination: PaginationRequest
    ){
        return this.permissionService.getPermissions(pagination);
    }

    @Get("/:id")
    @Permissions("permission.view")
    public getPermissionById(
        @Param("id", ParseIntPipe)id: number
    ) {
        return this.permissionService.getPermissionById(id);
    }

    @Post()
    @Permissions("permission.add")
    public createPermission(
        @Body(ValidationPipe) permissionDto: CreatePermissionRequestDto
    ) {
        return this.permissionService.createPermission(permissionDto);
    }

    @Put("/:id")
    @Permissions("permission.update")
    public updatePermission(
        @Param("id", ParseIntPipe)id: number,
        @Body(ValidationPipe) permissionDto: UpdatePermissionRequestDto
    ) {
        return this.permissionService.updatePermission(id, permissionDto);
    }

    @Delete("/:id")
    @Permissions("permission.delete")
    public deletePermission(
        @Param("id", ParseIntPipe)id: number
    ){
        return this.permissionService.deletePermission(id);
    }
}
