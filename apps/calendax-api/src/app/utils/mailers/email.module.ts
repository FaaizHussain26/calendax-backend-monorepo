import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { EmailService } from "./email.service";
import { ConfigModule, ConfigService } from "@nestjs/config";

const services = [EmailService];

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const host = config.get<string>("BREVO_HOST") || config.get<string>("SMTP_HOST") || "smtp-relay.brevo.com";
                const portValue = config.get<string>("BREVO_PORT") || config.get<string>("SMTP_PORT") || "587";
                const port = Number.parseInt(portValue, 10);
                const user = config.get<string>("BREVO_SMTP_USER") || config.get<string>("BREVO_USER") || config.get<string>("SMTP_USER");
                const pass = config.get<string>("BREVO_SMTP_KEY") || config.get<string>("SMTP_PASS");
                const hasApiKey = !!config.get<string>("BREVO_API_KEY");

                if (!pass && hasApiKey) {
                    return {
                        transport: {
                            jsonTransport: true,
                        },
                        defaults: {
                            from: config.get<string>("EMAIL_FROM"),
                        },
                    };
                }

                if (!user || !pass) {
                    throw new Error("Missing email credentials. Configure BREVO_API_KEY for API mode, or configure SMTP credentials via BREVO_SMTP_USER/BREVO_SMTP_KEY (or SMTP_USER/SMTP_PASS).");
                }

                return {
                    transport: {
                        host,
                        port: Number.isNaN(port) ? 587 : port,
                        secure: (Number.isNaN(port) ? 587 : port) === 465,
                        requireTLS: true,
                        auth: {
                            user,
                            pass,
                        },
                    },
                    defaults: {
                        from: config.get<string>("EMAIL_FROM"),
                    },
                };
            },
        }),
    ],
    controllers: [],
    providers: [...services],
    exports: [EmailService],
})

export class AppMailerModule {}