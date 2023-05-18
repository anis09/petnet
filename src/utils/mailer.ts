import htmlToText from 'html-to-text';
import nodemailer from 'nodemailer';
import pug from 'pug';
import { vars } from '../constants/vars';

export class Mailer {
    public to: string;
    public data: any;

    constructor(to: string, data: any) {
        this.to = to;
        this.data = data;
    }

    private newTransport() {
        return nodemailer.createTransport({
            host: vars.smtpHost,
            port: vars.smtpPort,
            auth: {
                user: vars.smtpUser,
                pass: vars.smtpPass
            }
        });
    }

    async sendEmail(template: string, subject: string) {
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            data: this.data,
            subject
        });

        const mailOptions = {
            from: vars.smtpUser,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendVerifyAccount() {
        await this.sendEmail('verify-account', 'Please verify your email address');
    }

    async sendResetPassword() {
        await this.sendEmail('reset-password', 'Reset your password');
    }

    async sendResetPasswordDash() {
        await this.sendEmail('reset-password-dash', 'Reset your password');
    }

    async sendGetPasswordDash() {
        await this.sendEmail('get-password-dash', 'Get your password');
    }
}