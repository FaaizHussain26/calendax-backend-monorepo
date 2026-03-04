import { BadRequestException, Injectable } from "@nestjs/common";
import * as brevo from '@getbrevo/brevo';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
    private apiInstance: brevo.TransactionalEmailsApi;

    constructor (
        private configService: ConfigService
    ) {
        const apiKey = this.configService.get<string>('BREVO_API_KEY') as string;
        this.apiInstance = new brevo.TransactionalEmailsApi();
        this.apiInstance.setApiKey(
            0, apiKey
        );
    }

    async sendOtpEmail(email: string, name: string, otp: string, type: string): Promise<any> {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.subject = this.getSubjectByType(type);
        sendSmtpEmail.htmlContent = this.getEmailTemplate(otp, type);
        sendSmtpEmail.sender = {
            name: "Calendax",
            email: "veiledghost161025@gmail.com"
        };
        sendSmtpEmail.to = [{
            email, name
        }];

        try{
            await this.apiInstance.sendTransacEmail(sendSmtpEmail);
        }catch (error) {
            throw new BadRequestException(error.msg);
        }
    }

    private getSubjectByType(type: string): string {
        const subjects = {
            email_verification: 'Verify your Email'
        }
        return subjects[type] || 'Verification Code';
    }


    private getEmailTemplate(otp: string, type: string): string {
        return `
        <!DOCTYPE html>
        <html>
            <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .otp-code { 
                font-size: 32px; 
                font-weight: bold;  
                color: #007bff; 
                letter-spacing: 8px; 
                text-align: center; 
                padding: 20px; 
                background: #f8f9fa; 
                border-radius: 8px; 
                margin: 20px 0; 
                }
                .warning { color: #dc3545; font-size: 14px; margin-top: 20px; }
            </style>
            </head>
            <body>
            <div class="container">
                <h2>Your Verification Code</h2>
                <p>Use the following code to complete your verification:</p>
                <div class="otp-code">${otp}</div>
                <div class="type">${type}</div>
                <p>This code will expire in 10 minutes.</p>
                <p class="warning">If you didn't request this code, please ignore this email.</p>
            </div>
            </body>
        </html>
        `;
    }
}