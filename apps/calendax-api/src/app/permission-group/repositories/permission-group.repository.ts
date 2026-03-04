import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PermissionGroup } from "../database/permission-group.entity";
import { PaginationService } from "../../utils/pagination/services/pagination.service";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { DeepPartial, DeleteResult, In, Repository } from "typeorm";

@Injectable()
export class PermissionGroupRepository {
    constructor(
        @InjectRepository(PermissionGroup) private readonly permissionGroupRepository: Repository<PermissionGroup>,
        private readonly paginationService: PaginationService,
    ) {}

    async getAll(
        pagination: PaginationRequest,
    ): Promise<[permissions: PermissionGroup[], total: number]> {
        return await this.paginationService.getPaginatedDataWithCount(
            this.permissionGroupRepository, ['permissions'],
            pagination,
        );
    }

    async getById(
        permissionGroupId: PermissionGroup['id']
    ): Promise<PermissionGroup | null> {
        return await this.permissionGroupRepository.findOne({
            where: { id: permissionGroupId },
            relations: ['permissions'],
        });
    }

    async getByIds(
        permissionGroupIds: PermissionGroup['id'][]
    ): Promise<PermissionGroup[] | null> {
        return await this.permissionGroupRepository.findBy({
            id: In(permissionGroupIds)
        });
    }

    async getByTitle(
        permissionGroupTitle: PermissionGroup['title']
    ): Promise<PermissionGroup | null> {
        return await this.permissionGroupRepository.findOneBy({
            title: permissionGroupTitle
        });
    }

    async create(
        permissionGroup: DeepPartial<PermissionGroup>
    ): Promise<PermissionGroup | null> {
        return await this.permissionGroupRepository.save(permissionGroup);
    }

    async update(
        permissionGroupId: PermissionGroup['id'],
        permissionGroup: DeepPartial<PermissionGroup>
    ): Promise<PermissionGroup> {
        await this.permissionGroupRepository.save({ id: permissionGroupId, ...permissionGroup });
        return await this.permissionGroupRepository.findOne({
            where: { id: permissionGroupId },
            relations: ['permissions'],
        });
    }

    async delete(
        permissionGroupId: PermissionGroup['id']
    ): Promise<DeleteResult> {
        return await this.permissionGroupRepository.delete(permissionGroupId);
    }
}