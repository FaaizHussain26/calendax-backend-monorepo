import { BadRequestException, Injectable, NotFoundException, RequestTimeoutException } from "@nestjs/common";
import { RoleRepository } from "../repositories/role.repository";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { PaginationResponseDto } from "../../utils/pagination/pagination-response.dto";
import { RoleResponseDto } from "../dtos/role-response.dto";
import { plainToInstance } from "class-transformer";
import { Pagination } from "../../utils/pagination/pagination.helper";
import { HandleDBError } from "../../utils/commonErrors/handle-db.error";
import { CreateRoleRequestDto } from "../dtos/create-role-dto";
import { RoleExistsException } from "../../utils/exceptions/role-already-exists.exception";
import { UpdateRoleRequestDto } from "../dtos/update-role.dto";
import { validatePositiveIntegerId } from "../../utils/commonErrors/permission-id.error";
import { DeleteResult } from "typeorm";
import { TimeoutError } from "rxjs";
import { PermissionRepository } from "../../permission/repositories/permission.repository";

@Injectable()
export class RoleService {
    constructor (
        private readonly roleRepository: RoleRepository,
        private readonly permissionRepository: PermissionRepository,
        private readonly DBError: HandleDBError,
    ) {}

    async getRoles(
        pagination: PaginationRequest
    ): Promise<PaginationResponseDto<RoleResponseDto>> {
        const [roles, total] = await this.roleRepository.getRoles(pagination);

        const dtos = plainToInstance(RoleResponseDto, roles);
        return Pagination.of(pagination, total, dtos);
    }

    async getRoleById(
        id: number
    ): Promise<RoleResponseDto> {
        validatePositiveIntegerId(id, 'Role ID');
        const roleEntity =  await this.roleRepository.getById(id);
        if(!roleEntity) {
            throw new NotFoundException();
        }
        return plainToInstance(RoleResponseDto, roleEntity);
    }

    async createRole(
        roleDto: CreateRoleRequestDto
    ): Promise<RoleResponseDto> {
        try {
            const existingRole = await this.roleRepository.getByName(roleDto.name);
            if (existingRole) {
                throw new RoleExistsException(roleDto.name);
            }

            const permissions = await this.permissionRepository.getByIds(
                roleDto.permissions
            );

            if (permissions.length !== roleDto.permissions.length) {
                throw new NotFoundException('One or more permissions not found');
            }

            const roleEntity = await this.roleRepository.create({
                name: roleDto.name,
                permissions
            });

            return plainToInstance(RoleResponseDto, roleEntity);
        }catch (error) {
            if (error instanceof RoleExistsException) throw error;
            if (error instanceof NotFoundException) throw error;
            throw this.DBError.handleDBError(error, new BadRequestException(error?.message));
        }
    }


    async updateRole(
        id: number,
        roleDto: UpdateRoleRequestDto
    ): Promise<RoleResponseDto> {
        validatePositiveIntegerId(id, 'Role ID');
        try {
            const roleEntity = await this.roleRepository.getById(id);
            if (!roleEntity) {
                throw new NotFoundException('Role not found');
            }

            if (roleDto.permissions) {
                const permissions = await this.permissionRepository.getByIds(roleDto.permissions);
                if (permissions.length !== roleDto.permissions.length) {
                    throw new NotFoundException('One or more permissions not found');
                }
                roleEntity.permissions = permissions;
            }

            if (roleDto.name) {
                roleEntity.name = roleDto.name;
            }

            const updated = await this.roleRepository.update(roleEntity);

            return plainToInstance(RoleResponseDto, updated);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw this.DBError.handleDBError(error, new BadRequestException(error?.message));
        }
    }

    async deleteRole(
        id: number
    ): Promise<DeleteResult> {
        validatePositiveIntegerId(id, 'Role ID');
        let roleEntity = await this.roleRepository.getById(id);
        if(!roleEntity) {
            throw new NotFoundException();
        }
        try {
            return await this.roleRepository.delete(id);
        }catch(error) {
            if(error instanceof TimeoutError) {
                throw new RequestTimeoutException();
            }else {
                throw new BadRequestException(error.message);
            }
        }
    }
}