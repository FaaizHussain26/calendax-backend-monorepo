import { Controller, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminLoginDto } from "./admin.dto";

@Controller("/admin")
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
    ) {}

    @Post('/login')    
    async logIn(dto: AdminLoginDto) {
        return await this.adminService.logIn(dto.email, dto.password);
    }
}