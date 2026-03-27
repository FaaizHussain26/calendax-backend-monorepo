import { Module } from "@nestjs/common";
import { AdminSeeder } from "./admin.seeder";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminEntity } from "./admin.entity";
import { AdminPermissions } from "./admin-permissions.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([AdminEntity, AdminPermissions]),
    ],
    providers: [AdminSeeder],
})

export class AdminModule {}