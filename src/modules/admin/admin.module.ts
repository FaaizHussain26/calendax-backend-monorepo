import { Module } from "@nestjs/common";
import { AdminSeeder } from "./admin.seeder";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminEntity } from "./entities/admin.entity";
import { AdminPermissions } from "./entities/admin-permissions.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([AdminEntity, AdminPermissions]),
    ],
    providers: [AdminSeeder],
})

export class AdminModule {}