import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminEntity } from "./admin.entity";
import { AdminRoles } from "../utils/enums/adminRoles.enum";
import { AdminPage } from "../utils/enums/adminPage.enum";
import { AdminPermissions } from "./admin-permissions.entity";

@Injectable()
export class AdminSeeder {
    constructor(
        @InjectRepository(AdminEntity)
        private readonly adminRepository: Repository<AdminEntity>,
        @InjectRepository(AdminPermissions)
        private readonly adminPermissionsRepository: Repository<AdminPermissions>,
    ) {}
    async onModuleInit() {
        try {
            const exists = await this.adminRepository.findOne({
                where: { role: AdminRoles.SUPER_ADMIN },
            });
            if(exists) return;

            const admin = this.adminRepository.create({
                name: 'Tariq',
                email: 'superadmin@dax.com',
                password: 'ChangeMe123',
                role: AdminRoles.SUPER_ADMIN,
            })

            const savedAdmin = await this.adminRepository.save(admin);

            const permissions = this.adminPermissionsRepository.create({
                //@ts-ignore
                admin: savedAdmin,
                page: AdminPage.TENANT,
                read: true,
                write: true,
            });

            await this.adminPermissionsRepository.save(permissions);

            console.log("Admin initialized");
        }catch(error) {
            throw new Error("An Error Occured");
        }
    }
}