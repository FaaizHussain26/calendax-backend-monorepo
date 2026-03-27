import { Injectable } from "@nestjs/common";
import { AdminRoles } from "../../utils/enums/admin.enum";
import { AdminRepository } from "./admin.repository";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeeder {
    constructor(
        private readonly adminRepository: AdminRepository,
    ) {}
    async onModuleInit() {
        try {
            const email = 'superadmin@dax.com';
            const exists = await this.adminRepository.getAdminByEmail(email);
            if(exists) return;
            const payload = {
                name: 'Super Admin',
                email: 'superadmin@dax.com',
                password: await bcrypt.hash('ChangeMe123', 10),
                role: AdminRoles.SUPER_ADMIN,
            }
            await this.adminRepository.createAdmin(payload);
            console.log("Super Admin initialized");
        }catch(error) {
            throw new Error("An Error Occured");
        }
    }
}