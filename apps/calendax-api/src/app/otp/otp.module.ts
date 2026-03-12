import { Module } from "@nestjs/common";
import { OtpRepository } from "./repositories/otp.repository";
import { OtpService } from "./services/otp.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OTP } from "./database/otp.entity";
import { ConfigModule} from "@nestjs/config";

import { UserModule } from "../user/user.module";
import { AppMailerModule } from "../utils/mailers/email.module";

const Services = [OtpService];
const Repositories = [OtpRepository];

@Module({
    imports: [
        TypeOrmModule.forFeature([OTP]),
        UserModule,
        ConfigModule,
        AppMailerModule,
    ],
    providers: [...Services, ...Repositories],
    exports: [OtpService],
})

export class OtpModule {}