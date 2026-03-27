import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminEntity } from "./entities/admin.entity";
import { Repository } from "typeorm";
import { AdminPermissions } from "./entities/admin-permissions.entity";

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
        const admin = await this.adminRepository.create(payload);
        return await this.adminRepository.save(admin);
    }

    //permissionRepository
    async findPermissions() {
        return await this.adminPermissionRepository.find({
            relations: ['permissions'],
        });
    }
}