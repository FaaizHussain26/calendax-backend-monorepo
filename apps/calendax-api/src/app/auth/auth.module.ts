import { Module } from "@nestjs/common";
import { AuthenticationController } from "./controllers/auth.controller";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { JWTService } from "../utils/commonservices/jwt.service";
import { AuthenticationService } from "./services/auth.service";
import { OtpModule } from "../otp/otp.module";
import { HashingService } from "../utils/commonservices/hashing.service";

const controllers = [AuthenticationController];
const services = [AuthenticationService, JWTService, HashingService];

@Module({
    imports: [
        UserModule,
        ConfigModule,
        OtpModule,
        JwtModule.register({})
    ],
    controllers,
    providers: [...services],
})

export class AuthenticationModule {}