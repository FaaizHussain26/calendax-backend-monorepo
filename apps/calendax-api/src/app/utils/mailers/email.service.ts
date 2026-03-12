import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailTemplates, OtpEmailTemplate, ResendLinkEmailTemplate } from "./email-template";
import axios from "axios";

interface Email {
  subject: string;
  toEmail: string;
  data: Record<string, string>;
}

interface MailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {}

  private shouldUseBrevoApiDirectly(): boolean {
    const hasBrevoApiKey = !!this.configService.get<string>("BREVO_API_KEY");
    const hasSmtpPassword = !!this.configService.get<string>("BREVO_SMTP_KEY") || !!this.configService.get<string>("SMTP_PASS");

    return hasBrevoApiKey && !hasSmtpPassword;
  }

  private isSmtpAuthError(err: unknown): boolean {
    if (!err || typeof err !== "object") {
      return false;
    }

    const smtpErr = err as { code?: string; responseCode?: number; command?: string };
    return smtpErr.code === "EAUTH" || smtpErr.responseCode === 535 || smtpErr.command === "AUTH PLAIN";
  }

  private parseFromAddress() {
    const rawFrom = this.configService.get<string>("EMAIL_FROM") || "";
    const match = rawFrom.match(/^(.*)<([^>]+)>$/);

    if (match) {
      return {
        name: match[1].trim().replace(/^"|"$/g, "") || "Calendax",
        email: match[2].trim(),
      };
    }

    const fallbackEmail = rawFrom || this.configService.get<string>("BREVO_USER") || "noreply@calendax.local";
    return {
      name: "Calendax",
      email: fallbackEmail,
    };
  }

  private async sendWithBrevoApi(mail: MailPayload) {
    const apiKey = this.configService.get<string>("BREVO_API_KEY");
    if (!apiKey) {
      throw new Error("BREVO_API_KEY is missing. Cannot use API fallback for email sending.");
    }

    const sender = this.parseFromAddress();

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender,
        to: [{ email: mail.to }],
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      },
      {
        headers: {
          "api-key": apiKey,
          accept: "application/json",
          "content-type": "application/json",
        },
      }
    );
  }

  private async sendMail(mail: MailPayload) {
    if (this.shouldUseBrevoApiDirectly()) {
      await this.sendWithBrevoApi(mail);
      console.log("Email sent successfully via Brevo API");
      return;
    }

    try {
      await this.mailerService.sendMail(mail);
      console.log("Email sent successfully");
    } catch (err) {
      if (!this.isSmtpAuthError(err)) {
        throw err;
      }

      console.warn("SMTP auth failed. Falling back to Brevo API transport.");
      await this.sendWithBrevoApi(mail);
      console.log("Email sent successfully via Brevo API fallback");
    }
  }

  async sendDynamicEmail(email: Email) {
    try {
      const bodyTemplate = EmailTemplates({
        recipientName: email.data["recipient_name"] || "User",
        profileUrl: `${this.configService.get("FRONTEND_BASE_EMAIL_URL")}${email.data["profile_url"] || "#"}`,
      });

      const subject = email.subject || "Patient Status Update";

      await this.sendMail({
        to: email.toEmail,
        subject: subject,
        html: bodyTemplate,
      });
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

      await this.sendMail({
        to: email.toEmail,
        subject: email.subject ?? 'Your resend link',
        html: bodyTemplate,
      });
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

      await this.sendMail({
        to: email.toEmail,
        subject: email.subject,
        html: bodyTemplate,
      });
    } catch (err) {
      console.error("Error sending email:", err);
      throw err;
    }
  }

  async sendThanksEmail(email: Email) {
    try {
      await this.sendMail({
        to: email.toEmail,
        subject: email.subject ?? 'Thank you for your submission',
        text:
          email.data["message"] || "We have received a new lead from Facebook",
      });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }
}
