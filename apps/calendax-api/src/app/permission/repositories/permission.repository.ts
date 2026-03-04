import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, In, Repository } from "typeorm";
import { UpdateResult } from "typeorm/browser";
import { DeleteResult } from "typeorm/browser";
import { Permission } from "../database/permission.entity";
import { PaginationService } from "../../utils/pagination/services/pagination.service";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PermissionRepository {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        private readonly paginationService: PaginationService,
    ) {}

    async getPermissions(
        pagination: PaginationRequest
    ): Promise<[permissions: Permission[], total: number]> {
        return await this.paginationService.getPaginatedDataWithCount(
            this.permissionRepository,
            [],
            pagination,
        );
    }

    async getAllPermissions(): Promise<Permission[]> {
        return await this.permissionRepository.find({
            where: { active: true },
            order: { name: 'ASC'},
        });
    }

    async getById(
        permissionId: Permission['id']
    ): Promise<Permission | null> {
        return await this.permissionRepository.findOneBy({ id: permissionId });
    }

    async getByIds(
        permissionIds: Permission['id'][]
    ): Promise<Permission[]> {
        return await this.permissionRepository.findBy({
            id: In(permissionIds),
        });
    }

    async getBySlug(
        slug: Permission['slug']
    ): Promise<Permission | null> {
        return await this.permissionRepository.findOneBy({ slug });
    }

    async create(
        permission: DeepPartial<Permission>
    ): Promise<Permission | null> {
        return await this.permissionRepository.save(permission);
    }

    async update(
        permission: DeepPartial<Permission>
    ): Promise<UpdateResult> {
        return await this.permissionRepository.update(permission.id, permission);
    }

    async delete(
        permissionId: Permission['id']
    ): Promise<DeleteResult> {
        return await this.permissionRepository.delete(permissionId);
    }
}