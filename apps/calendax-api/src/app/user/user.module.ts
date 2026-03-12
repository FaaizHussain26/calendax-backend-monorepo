import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./database/user.orm";
import { UserController } from "./controllers/user.controller";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { Module } from "@nestjs/common";
import { HashingService } from "../utils/commonservices/hashing.service";
import { HandleDBError } from "../utils/commonErrors/handle-db.error";

const controllers = [UserController];
const services = [UserService, HashingService, HandleDBError];
const repositories = [UserRepository];

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
    ],
    controllers,
    providers: [...services, ...repositories],
    exports: [UserService, UserRepository]
})

export class UserModule {}