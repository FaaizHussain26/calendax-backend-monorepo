import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "../database/role.entity";
import { DeepPartial, In, Repository } from "typeorm";
import { PaginationService } from "../../utils/pagination/services/pagination.service";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { DeleteResult } from "typeorm/browser";

@Injectable()
export class RoleRepository {
    constructor (
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        private readonly paginationService: PaginationService,
    ) {}

    async getRoles(
        pagination: PaginationRequest,
    ): Promise<[roles: Role[], total: number]> {
        return await this.paginationService.getPaginatedDataWithCount(
            this.roleRepository, ['permissions'],
            pagination
        );
    }

    async getById(
        id: Role['id']
    ): Promise<Role | null> {
        return await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
    }

    async getByIds(
        roleIds: Role['id'][]
    ): Promise<Role[] | null> {
        return await this.roleRepository.findBy({ id: In(roleIds) });
    }

    async getByName(
        name: Role['name']
    ): Promise<Role | null> {
        return await this.roleRepository.findOneBy({ name: name });
    }

    async create(
        role: DeepPartial<Role>
    ): Promise<Role | null> {
        const newRole = this.roleRepository.create(role);
        return await this.roleRepository.save(newRole);
    }

    async update(
        role: DeepPartial<Role>
    ): Promise<Role> {
        return await this.roleRepository.save(role);
    }

    async delete(
        id: Role['id']
    ): Promise<DeleteResult> {
        return await this.roleRepository.delete(id);
    }
}