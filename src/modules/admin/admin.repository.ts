import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminEntity } from "./entities/admin.entity";
import { In, Repository } from "typeorm";
import { AdminPermissions } from "./entities/admin-permissions.entity";
import { plainToInstance } from "class-transformer";
import { AdminResponseDto } from "./admin.dto";

@Injectable()
export class AdminRepository {
    constructor(
        @InjectRepository(AdminEntity)
        private readonly adminRepository: Repository<AdminEntity>,
        @InjectRepository(AdminPermissions)
        private readonly adminPermissionRepository: Repository<AdminPermissions>,
    ) {}

    async getAdminByEmail(email: string) {
        return await this.adminRepository.findOne({
            where: { email },
        })
    }

    async createAdmin(payload: Partial<AdminEntity>) {
        const createdEntity = this.adminRepository.create(payload);
        return await this.adminRepository.save(createdEntity);
    }

    async getAdminById(id: string) {
        return await this.adminRepository.findOne({
            where: { id },
        });
    }

    async getAllAdmins() {
        const admins = await this.adminRepository.find();
        return plainToInstance(AdminResponseDto, admins, {
            excludeExtraneousValues: true,
        })
    }

    async updateAdmin(id: string, payload: Partial<AdminEntity>) {
        const updatedEntity = this.adminRepository.update(id, payload);
        return updatedEntity;
    }

    async delete(id: string) {
        return await this.adminRepository.delete(id);
    }

    //permissionRepository
    async findPermissions(id:string) {
        return await this.adminPermissionRepository.find();
    }
}