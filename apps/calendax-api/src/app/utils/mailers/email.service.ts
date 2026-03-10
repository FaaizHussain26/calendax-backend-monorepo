import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailTemplates, OtpEmailTemplate, ResendLinkEmailTemplate } from "./email-template";

interface Email {
  subject?: string;
  toEmail: string;
  data: Record<string, string>;
}
@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {}

  async sendDynamicEmail(email: Email) {
    try {
      const bodyTemplate = EmailTemplates({
        recipientName: email.data["recipient_name"] || "User",
        profileUrl: `${this.configService.get("FRONTENT_BASE_EMAIL_URL")}${email.data["profile_url"] || "#"}`,
      });

      const subject = email.subject || "Patient Status Update";

      await this.mailerService.sendMail({
        to: email.toEmail,
        subject: subject,
        html: bodyTemplate,
      });
      console.log("Email sent successfully");
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }

  async sendResentLink(email: Email) {
    try {
      const bodyTemplate = ResendLinkEmailTemplate({
        expiresIn: email.data["expiresIn"] || "1h",
        resetLink: email.data["resetLink"],
      });

      await this.mailerService.sendMail({
        to: email.toEmail,
        subject: email.subject,
        html: bodyTemplate,
      });
      console.log("Email sent successfully");
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }

  async sendOtp(email: Email) {
    try {
      const bodyTemplate = OtpEmailTemplate({
        otpCode: email.data["otpCode"],
        expiresIn: email.data["expiresIn"],
      });

      await this.mailerService.sendMail({
        to: email.toEmail,
        subject: email.subject,
        html: bodyTemplate,
      });
      console.log("Email sent successfully");
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }

  async sendThanksEmail(email: Email) {
    try {
      await this.mailerService.sendMail({
        to: email.toEmail,
        subject: email.subject,
        text:
          email.data["message"] || "We have received a new lead from Facebook",
      });
      console.log("Email sent successfully");
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }
}
