import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PermissionGroupRepository } from "../repositories/permission-group.repository";
import { HandleDBError } from "../../utils/commonErrors/handle-db.error";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { PaginationResponseDto } from "../../utils/pagination/pagination-response.dto";
import { PermissionGroupResponseDto } from "../dtos/permission-group-response.dto";
import { plainToInstance } from "class-transformer";
import { Pagination } from "../../utils/pagination/pagination.helper";
import { validatePositiveIntegerId } from "../../utils/commonErrors/permission-id.error";
import { CreatePermissionGroupRequestDto } from "../dtos/create-permission-group-response.dto";
import { PermissionGroupExistsException } from "../../utils/exceptions/permission-group-exists.exception";
import { UpdatePermissionGroupRequestDto } from "../dtos/update-permission-group-response.dto";
import { DeleteResult } from "typeorm";

@Injectable()
export class PermissionGroupService {
    constructor(
        private readonly permissionGroupRepository: PermissionGroupRepository,
        private readonly DBError: HandleDBError,
    ) {}

    async getPermissionGroups(
        pagination: PaginationRequest
    ): Promise<PaginationResponseDto<PermissionGroupResponseDto>> {
        const [permission_group, total] = await this.permissionGroupRepository.getAll(pagination);
        const dtos = plainToInstance(PermissionGroupResponseDto, permission_group);
        return Pagination.of(pagination, total, dtos);
    }

    async getPermissionGroupById(
        id: number
    ): Promise<PermissionGroupResponseDto> {
        validatePositiveIntegerId(id, 'Permission Group ID');
        const permissionGroupEntity = await this.permissionGroupRepository.getById(id);
        if(!permissionGroupEntity) {
            throw new NotFoundException();
        }
        return plainToInstance(PermissionGroupResponseDto, permissionGroupEntity);
    }


    async createPermissionGroup(
        permissionGroupDto: CreatePermissionGroupRequestDto
    ): Promise<PermissionGroupResponseDto> {
        try {
            const existingRole = await this.permissionGroupRepository.getByTitle(permissionGroupDto.title);
            if (existingRole) {
                throw new PermissionGroupExistsException(permissionGroupDto.title);
            }
            const createData = {
                ...permissionGroupDto,
                permissions: permissionGroupDto.permissions?.map(id => ({ id }))
            };
            const permissionGroupEntity = await this.permissionGroupRepository.create(createData);

            return plainToInstance(PermissionGroupResponseDto, permissionGroupEntity);
        }catch (error) {
            if (error instanceof PermissionGroupExistsException) throw error;
            if (error instanceof NotFoundException) throw error;
            throw this.DBError.handleDBError(error, new BadRequestException(error?.message));
        }
    }

    async updatePermissionGroup(
        id: number,
        payload: UpdatePermissionGroupRequestDto,
    ): Promise<PermissionGroupResponseDto> {
        const existingPermissionGroup = await this.permissionGroupRepository.getById(id);
        if(!existingPermissionGroup) {
            throw new NotFoundException('Permission Group not found!');
        }
        const updateData = {
            ...payload,
            permissions: payload.permissions?.map(permId => ({ id: permId }))
        };
        const permissionGroupEntity = await this.permissionGroupRepository.update(
            id, updateData
        );
        return plainToInstance(PermissionGroupResponseDto, permissionGroupEntity);
    }

    async deletePermissionGroup(
        id: number
    ): Promise<DeleteResult> {
        return await this.permissionGroupRepository.delete(id);
    }
}