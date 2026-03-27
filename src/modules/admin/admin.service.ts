import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtHelper } from "src/common/jwt/jwt.provider";
import { AdminRoles } from "../../utils/enums/admin.enum";
import { AdminRepository } from "./admin.repository";

@Injectable()
export class AdminService {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly jwtHelper: JwtHelper,
    ) {}

    async logIn(email: string, password: string) {
        const admin = await this.adminRepository.getAdminByEmail(email);
        if(!admin) {
            throw new NotFoundException('Admin Not found');
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch) {
            throw new UnauthorizedException('Invalid Password');
        }
            const payload:any = {
            id: admin.id,
            role: admin.role,
        }
        if(admin.role === AdminRoles.ADMIN) {
            await this.adminRepository.findPermissions();
        }
        return this.jwtHelper.issueToken(payload);
    }
}