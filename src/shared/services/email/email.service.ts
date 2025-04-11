import { Injectable } from "@nestjs/common";
import AWS from "aws-sdk";
import sgMail from "@sendgrid/mail";
import { ConfigService } from "@nestjs/config";

// create reusable transporter object using the default SMTP transport
// let nmTransporter = nodemailer.createTransport({
//   host: "smtp.transip.email",
//   port: 465,
//   secure: true, // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_EMAIL,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

@Injectable()
export class EmailService {
  public domain = process.env.APP_DOMAIN;

  constructor(private readonly configService: ConfigService) {
  }

  loadTemplate(identifier: string, data: any): string {
    switch (identifier) {
      case "account-verification": {
        const link = this.domain + "/verify-account/" + data[`email`] + "/" + data[`verification`];
        return `
          <h1>Hello! Greetings of the day.</h1>
          Please click on the link to verify your account<br>
          <a href="${link}">${link}</a>
        `;
      }
      case "forgot-password": {
        return `
          <h1>Hello! Greetings of the day.</h1>
          Please use this pin to reset your password <strong>${data?.pin}</strong>
        `;
      }
      case "login-otp": {
        return `
          <h1>Hello! Greetings of the day.</h1>
          Please use this otp to login <strong>${data?.pin}</strong>
        `;
      }

      default:
        break;
    }
  }

  async sendUsingSendGrid(
    to: string,
    subject: string,
    body: string,
    text = ''
  ) {
    // return nmTransporter.sendMail({
    //   from: process.env.SMTP_EMAIL,
    //   to: toEmail, // comma separated emails.
    //   subject: subject, // Subject line
    //   text: textMessage, // plain text body
    //   html: htmlPage, // html body
    // });
    try {
      sgMail.setApiKey(this.configService.get("sendGridApiKey"));
      return await sgMail
        .send({
          from: this.configService.get("fromEmail"),
          to: to,
          subject: subject,
          text: text || body,
          html: body, // html body
        });
    } catch (error) {
      console.error(error.response);
    }
  }

  async sendUsingSes({
    to,
    subject,
    body,
    source = this.configService.get("fromEmail"),
  }: { to: string[] | string; subject: string; body: string; source?: string }) {
    AWS.config.update({
      region: this.configService.get("region"),
      accessKeyId: this.configService.get("accessKeyId"),
      secretAccessKey: this.configService.get("secretAccessKey")
    });
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });

    const params = {
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: source,
    };

    return new Promise((resolve, reject) => {
      ses.sendEmail(params, (err, data) => {
        if (err) {
          console.error('Error sending email:', err);
          reject(err);
          return;
        }
        resolve(data);
      });
    })
  }
}
