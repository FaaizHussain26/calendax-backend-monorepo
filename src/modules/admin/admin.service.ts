import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { AdminRoles } from "../../utils/enums/admin.enum";
import { AdminRepository } from "./admin.repository";
import { AdminResponseDto, CreateAdminDto, UpdateAdminDto } from "./admin.dto";
import { plainToInstance } from "class-transformer";
import { JwtHelper } from "../../common/jwt/jwt.provider";
import { entityNotFound } from "../../utils/exceptions/notFound.exception";
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
            await this.adminRepository.findPermissions(admin.id);
        }
        return this.jwtHelper.issueToken(payload);
    }

    async getAllAdmins() {
        try {
            return await this.adminRepository.getAllAdmins();
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async getAdminById(id: string) {
        try {
            const admin = await this.adminRepository.getAdminById(id);
            entityNotFound(admin, "Admin");
            return admin;
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async createAdmin(payload: CreateAdminDto) {
        try {
            const exisitingEntity = await this.adminRepository.getAdminByEmail(payload.email);
            if(exisitingEntity) {
                throw new BadRequestException("Email already exists");
            }
            const hashedPass = await bcrypt.hash(payload.password, 10);
            const admin = await this.adminRepository.createAdmin({
                ...payload,
                password: hashedPass,
            });
            return plainToInstance(AdminResponseDto, admin);
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async updateAdmin(id: string, payload: UpdateAdminDto) {
        try {
            const exisitingEntity = await this.adminRepository.getAdminById(id);
            entityNotFound(exisitingEntity, "Admin");
            if(payload.password) {
                const hashedPass = await bcrypt.hash(payload.password, 10);
                payload.password = hashedPass;
            }
            await this.adminRepository.updateAdmin(id, payload);
            const admin = await this.adminRepository.getAdminById(id);
            return plainToInstance(AdminResponseDto, admin, { excludeExtraneousValues: true });
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async deleteAdmin(id: string) {
        try {
            const exisitingEntity = await this.adminRepository.getAdminById(id);
            entityNotFound(exisitingEntity, "Admin");
            return await this.adminRepository.delete(id);
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }
}