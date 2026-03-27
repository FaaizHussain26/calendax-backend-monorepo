import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminLoginDto, CreateAdminDto, UpdateAdminDto } from "./admin.dto";

@Controller("/admin")
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
    ) {}

    @Post('/login')    
    async logIn(@Body() dto: AdminLoginDto) {
        return await this.adminService.logIn(dto.email, dto.password);
    }

    @Get("/")
    async getAll() {
        return await this.adminService.getAllAdmins();
    }

    @Get("/:id")
    async getById(@Param('id', ParseUUIDPipe)id: string) {
        return await this.adminService.getAdminById(id);
    }

    @Post("/")
    async createAdmin(@Body() payload: CreateAdminDto) {
        return await this.adminService.createAdmin(payload);
    }

    @Patch("/:id")
    async updateAdmin(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() payload: UpdateAdminDto
    ) {
        return await this.adminService.updateAdmin(id, payload);
    }

    @Delete("/:id")
    async deleteAdmin(@Param('id', ParseUUIDPipe) id: string) {
        await this.adminService.deleteAdmin(id);
        return { message: "Admin deleted successfully" };
    }
}