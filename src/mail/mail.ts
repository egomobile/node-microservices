/**
 * This file is part of the @egomobile/microservices distribution.
 * Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
 *
 * @egomobile/microservices is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * @egomobile/microservices is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { Transporter } from 'nodemailer';

const nodemailer = require('nodemailer');

/**
 * Options for 'Mail' class.
 */
export interface IMailOptions {
    /**
     * The email host.
     */
    emailHost: string;
    /**
     * The email port.
     */
    emailPort?: number;
    /**
     * Should the email be send secure?
     */
    emailSecure?: boolean;
    /**
     * The email auth user.
     */
    emailUser?: string;
    /**
     * The email auth password.
     */
    emailPassword?: string;
    /**
     * The email from field.
     */
    emailFrom: string;
    /**
     * The email to field.
     */
    emailTo: string;
}

/**
 * Sending a Mail via nodemailer.
 */
export class Mail {
    protected readonly options: Partial<IMailOptions>;
    protected readonly transporter: Transporter;

    /**
     * Initializes a new instance of that class.
     *
     * @param {IMailOptions} [options] Custom options.
     */
    constructor(options?: IMailOptions) {
        const EMAIL_HOST = process.env.EMAIL_HOST?.trim();
        const EMAIL_PORT = process.env.EMAIL_PORT?.trim();
        const EMAIL_SECURE = process.env.EMAIL_SECURE?.toLowerCase().trim();
        const EMAIL_USER = process.env.EMAIL_FROM?.trim();
        const EMAIL_PASSWORD = process.env.EMAIL_FROM?.trim();
        const EMAIL_FROM = process.env.EMAIL_FROM?.trim();
        const EMAIL_TO = process.env.EMAIL_TO?.trim();

        let emailHost: string | undefined;
        let emailPort: number | undefined;
        let isEmailSecure: boolean | undefined;
        let emailUser: string | undefined;
        let emailPassword: string | undefined;
        let emailFrom: string | undefined;
        let emailTo: string | undefined;

        if (options) {
            emailHost = options.emailHost;
            emailPort = options.emailPort;
            isEmailSecure = options.emailSecure;
            emailUser = options.emailUser;
            emailPassword = options.emailPassword;
            emailFrom = options.emailFrom;
            emailTo = options.emailTo;
        } else {
            emailHost = EMAIL_HOST;
            emailPort = Number(EMAIL_PORT);
            isEmailSecure = Boolean(EMAIL_SECURE);
            emailUser = EMAIL_USER;
            emailPassword = EMAIL_PASSWORD;
            emailFrom = EMAIL_FROM;
            emailTo = EMAIL_TO;
        }

        this.options = {
            emailHost: emailHost,
            emailPort: emailPort ? emailPort : 25,
            emailSecure: typeof isEmailSecure === 'undefined' ? false : isEmailSecure,
            emailUser: emailUser ? emailUser : undefined,
            emailPassword: emailPassword ? emailPassword : undefined,
            emailFrom: emailFrom,
            emailTo: emailTo
        };

        this.checkOptionsOrThrow();

        this.transporter = nodemailer.createTransport({
            host: this.options.emailHost,
            port: this.options.emailPort,
            secure: this.options.emailSecure,
            auth: {
                user: this.options.emailUser,
                pass: this.options.emailPassword
            }
        });
    }

    private checkOptionsOrThrow() {
        const { emailHost, emailFrom, emailTo } = this.options;

        if (!emailHost?.length) {
            throw new Error('No EMAIL_HOST defined');
        }

        if (!emailFrom?.length) {
            throw new Error('No EMAIL_FROM defined');
        }

        if (!emailTo?.length) {
            throw new Error('No EMAIL_TO defined');
        }
    }

    /**
     * Send an email
     *
     * @param {string} subject the subject
     * @param {string} text the text
     *
     * @return {void}
     */
    public async sendMail(subject: string, text: string) {
        await this.transporter.sendMail({
            from: this.options.emailFrom,
            to: this.options.emailTo,
            subject: subject,
            text: text
        });
    }
}
