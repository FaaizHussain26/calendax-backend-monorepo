export interface EmailTemplateData {
  recipientName: string;
  profileUrl: string;
}

export function EmailTemplates(data: EmailTemplateData): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #000;
      background: #fff;
      -webkit-text-size-adjust: 100%;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      font-size: 20px;
      margin: 0 0 20px 0;
      padding: 12px 0;
      border-bottom: 1px solid #000;
    }


    .small {
      margin-top: 16px;
      font-size: 13px;
      color: #555;
      word-break: break-all;
    }

    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #000;
      padding-top: 10px;
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="wrapper">

    <p>Hello ${data.recipientName},</p>
    <p>This is to let you know about the current status</p>

    <p>
      You can view your profile using the link below.  
      Please keep it confidential and do not share it publicly.
    </p>

   
    <p class="small">
      open in browser:<br>
      <a href="${data.profileUrl}" target="_blank" rel="noopener noreferrer">
        ${data.profileUrl}
      </a>
    </p>

    <div class="footer">
      This is an automated message. Please do not reply.
    </div>

  </div>
</body>
</html>`;
}

export interface ResendLinkEmailTemplateData {
  resetLink: string;
  expiresIn: string;
}

export function ResendLinkEmailTemplate(
  data: ResendLinkEmailTemplateData
): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #000;
      background-color: #f4f6f8;
      -webkit-text-size-adjust: 100%;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #ffffff;
    }

    h1 {
      font-size: 20px;
      margin: 0 0 20px 0;
      padding: 12px 0;
      border-bottom: 1px solid #000;
    }

    p {
      font-size: 15px;
      line-height: 1.6;
      color: #333;
    }

    .small {
      margin-top: 16px;
      font-size: 13px;
      color: #555;
      word-break: break-word;
    }

    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #000;
      padding-top: 10px;
      text-align: center;
    }

    /* Fallback for Gmail and Outlook */
    .btn {
      background-color: #0b74de;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: bold;
      padding: 12px 22px;
      display: inline-block;
      border-radius: 5px;
      border: 1px solid #0b74de;
    }
  </style>
</head>

<body>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;padding:20px;">

          <tr>
            <td>

              <h1>Reset Your Password</h1>

              <p>Hello</p>

              <p>
                We received a request to reset your password.
                Click the button below to continue:
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px 0;">
                <tr>
                  <td align="center" bgcolor="#0b74de" style="border-radius:5px;">
                    <a href="${data.resetLink}"
                       target="_blank"
                       class="btn">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p>
                This link will expire in <strong>${data.expiresIn}</strong>.
              </p>

              <p>
                If you did not request a password reset, you can safely ignore this email.
              </p>

              <p class="small">
                If the button doesn't work,
                <br>
                <a href="${data.resetLink}" target="_blank">
                Click Here
                </a>
              </p>

              <div class="footer">
                This is an automated message. Please do not reply.
              </div>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
export interface OtpEmailTemplateData {
  otpCode: string;
  expiresIn: string;
}
export function OtpEmailTemplate(data: OtpEmailTemplateData): string {
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #000;
      background-color: #f4f6f8;
      -webkit-text-size-adjust: 100%;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #ffffff;
    }

    h1 {
      font-size: 20px;
      margin: 0 0 20px 0;
      padding: 12px 0;
      border-bottom: 1px solid #000;
    }

    p {
      font-size: 15px;
      line-height: 1.6;
      color: #333;
    }

    .otp {
      display: block;
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
      color: #0b74de;
      text-align: center;
    }

    .small {
      margin-top: 16px;
      font-size: 13px;
      color: #555;
      word-break: break-word;
    }

    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #000;
      padding-top: 10px;
      text-align: center;
    }
  </style>
</head>

<body>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;padding:20px;">

          <tr>
            <td>

              <h1>Your One-Time Password (OTP)</h1>

             <p>
                Use the code below to continue:
              </p>

              <!-- OTP Text -->
              <span class="otp">${data.otpCode}</span>

              <p>
                This OTP will expire in <strong>${data.expiresIn}</strong>.
              </p>

              <p>
                If you did not request this OTP, you can safely ignore this email.
              </p>

              <div class="footer">
                This is an automated message. Please do not reply.
              </div>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}
