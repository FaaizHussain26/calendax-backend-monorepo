import { Injectable, RequestTimeoutException } from "@nestjs/common";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { PaginationResponseDto } from "../../utils/pagination/pagination-response.dto";
import { PermissionRepository } from "../repositories/permission.repository";
import { PermissionResponseDto } from "../dtos/permission-response.dto";
import { plainToInstance } from "class-transformer";
import { BadRequestException, NotFoundException } from "../../utils/exceptions/common.exceptions";
import { CreatePermissionRequestDto } from "../dtos/create-permission-request.dto";
import { HandleDBError } from "../../utils/commonErrors/handle-db.error";
import { PermissionExistsException } from "../../utils/exceptions/permission-exists.exception";
import { TimeoutError } from "rxjs";
import { UpdatePermissionRequestDto } from "../dtos/update-permission-request.dto";
import { validatePositiveIntegerId } from "../../utils/commonErrors/permission-id.error";
import { permissionNotFound } from "../../utils/exceptions/not-found.exception";

@Injectable()
export class PermissionService {
    constructor(
        private readonly permissionRepository: PermissionRepository,
        private readonly DBError: HandleDBError,
    ) {}

    async getPermissions(
        pagination: PaginationRequest
    ): Promise<PaginationResponseDto<PermissionResponseDto>> {
        const permissions = await this.permissionRepository.getAllPermissions();

        const dtos = permissions.map(permission=> plainToInstance(PermissionResponseDto, permission));

        return{
            totalPages: 1,
            payloadSize: dtos.length,
            hasNext: false,
            content: dtos,
            currentPage: 1,
            skippedRecords: 0,
            totalRecords: dtos.length,
        };
    }

    public async getPermissionById(id: number): Promise<PermissionResponseDto> {
        const permissionEntity = await this.permissionRepository.getById(id);
        permissionNotFound(permissionEntity);
        return plainToInstance(PermissionResponseDto, permissionEntity);
    }

    public async createPermission(
        permission: CreatePermissionRequestDto
    ): Promise<PermissionResponseDto> {
        try {
            const permissionEntity = await this.permissionRepository.create(permission);
            return plainToInstance(PermissionResponseDto, permissionEntity);
        }catch(error){
            return this.DBError.handleDBError(error, new PermissionExistsException(error.slug));
        }
    }

    public async updatePermission(
        id: number,
        permissionDto: UpdatePermissionRequestDto,
    ): Promise<PermissionResponseDto> {
        validatePositiveIntegerId(id, 'Permission ID');
        try {
            let permissionEntity = await this.permissionRepository.getById(id);
            permissionNotFound(permissionEntity);
            const merged = {...permissionEntity, ...permissionDto};
            await this.permissionRepository.update(merged);
            const permissionUpdate = await this.permissionRepository.getById(id);
            return plainToInstance(PermissionResponseDto, permissionUpdate);
        } catch(error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            const dbError: any = error;
            return this.DBError.handleDBError(error, new PermissionExistsException(dbError.slug));
        }
    }

    public async deletePermission(id: number): Promise<void> {
        validatePositiveIntegerId(id, 'Permission ID');
        try {
            const permissionEntity = await this.permissionRepository.getById(id);
            permissionNotFound(permissionEntity);
            await this.permissionRepository.delete(id);
        }catch(error) {
            if(error instanceof TimeoutError) {
                throw new RequestTimeoutException();
            } throw new BadRequestException(error.message);
        }
    }
}