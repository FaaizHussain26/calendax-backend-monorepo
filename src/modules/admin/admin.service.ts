import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminEntity } from "./entities/admin.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ConfigService } from "@nestjs/config";
import { JwtHelper } from "src/common/jwt/jwt.provider";
import { AdminRoles } from "../../utils/enums/admin.enum";
import { AdminPermissions } from "./entities/admin-permissions.entity";

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(AdminEntity)
        private readonly adminRepository: Repository<AdminEntity>,
        @InjectRepository(AdminPermissions)
        private readonly adminPermissionsRepository: Repository<AdminPermissions>,
        private readonly configService: ConfigService,
        private readonly jwtHelper: JwtHelper,
    ) {}

    async logIn(email: string, password: string) {
        const admin = await this.adminRepository.findOne({
            where: { email },
        });
        if(!admin) {
            throw new NotFoundException('Not found');
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch) {
            throw new UnauthorizedException('Invalid Password');
        }
            const payload = {
            id: admin.id,
            role: admin.role,
        }
        if(admin.role === AdminRoles.ADMIN) {
            const permissions = await this.adminPermissionsRepository.find({
             relations: ['permissions']
            })
        }
        return this.jwtHelper.issueToken(payload);
    }
}