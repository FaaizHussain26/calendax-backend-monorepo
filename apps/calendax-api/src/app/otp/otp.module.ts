import { Module } from "@nestjs/common";
import { OtpRepository } from "./repositories/otp.repository";
import { OtpService } from "./services/otp.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OTP } from "./database/otp.entity";
import { ConfigModule} from "@nestjs/config";
import { EmailService } from "../utils/mailers/email.service";
import { UserModule } from "../user/user.module";

const Services = [OtpService, EmailService]
const Repositories = [OtpRepository]

@Module({
    imports: [
        TypeOrmModule.forFeature([OTP]),
        UserModule,
        ConfigModule,
    ],
    providers: [...Services, ...Repositories],
    exports: [OtpService],
})

export class OtpModule {}