import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { EmailService } from "./email.service";
import { ConfigService } from "@nestjs/config";

const services = [EmailService];

@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get<string>("BREVO_HOST"),
                    port: config.get<number>("BREVO_POR"),
                    secure: true,
                    auth: {
                        user: config.get<string>("BREVO_USER"),
                        pass: config.get<string>("BREVO_API_KEY"),
                    },
                },
                defaults: {
                    from: config.get<string>("EMAIL_FROM"),
                },
            }),
        }),
    ],
    controllers: [],
    providers: [...services],
    exports: [EmailService],
})

export class AppMailerModule {}