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
 * Additional options for 'sendMail()' function.
 */
export interface ISendMailOptions {
    /**
     * Use HTML instead of plain text or not.
     */
    html?: boolean;
}

/**
 * Get all options.
 *
 * @returns {IMailOptions} the options
 */
function getOptions(): IMailOptions {
    const EMAIL_HOST = process.env.EMAIL_HOST?.trim();
    const EMAIL_PORT = process.env.EMAIL_PORT?.trim();
    const EMAIL_SECURE = process.env.EMAIL_SECURE?.toLowerCase().trim();
    const EMAIL_USER = process.env.EMAIL_FROM?.trim();
    const EMAIL_PASSWORD = process.env.EMAIL_FROM?.trim();
    const EMAIL_FROM = process.env.EMAIL_FROM?.trim();
    const EMAIL_TO = process.env.EMAIL_TO?.trim();

    let emailHost: string | undefined = EMAIL_HOST;
    let emailPort: number | undefined = Number(EMAIL_PORT);
    let isEmailSecure: boolean | undefined = Boolean(EMAIL_SECURE);
    let emailUser: string | undefined = EMAIL_USER;
    let emailPassword: string | undefined = EMAIL_PASSWORD;
    let emailFrom: string | undefined = EMAIL_FROM;
    let emailTo: string | undefined = EMAIL_TO;

    if (!emailHost?.length) {
        throw new Error('No EMAIL_HOST defined');
    }

    if (!emailFrom?.length) {
        throw new Error('No EMAIL_FROM defined');
    }

    if (!emailTo?.length) {
        throw new Error('No EMAIL_TO defined');
    }

    return {
        emailHost: emailHost!,
        emailPort: emailPort ? emailPort : 25,
        emailSecure: typeof isEmailSecure === 'undefined' ? false : isEmailSecure,
        emailUser: emailUser ? emailUser : undefined,
        emailPassword: emailPassword ? emailPassword : undefined,
        emailFrom: emailFrom!,
        emailTo: emailTo!
    };
}

/**
 * Send an email
 *
 * @param {string} subject the subject
 * @param {string} body the body
 * @param {ISendMailOptions} [options] additional options
 *
 * @return {Promise<void>}
 */
export async function sendMail(subject: string, body: string, options?: ISendMailOptions) {
    const mailOptions: IMailOptions = getOptions();
    const shouldUseHTML = !!options?.html;

    let transporter = nodemailer.createTransport({
        host: mailOptions.emailHost,
        port: mailOptions.emailPort,
        secure: mailOptions.emailSecure,
        auth: mailOptions.emailUser && mailOptions.emailPassword ? {
            user: mailOptions.emailUser,
            pass: mailOptions.emailPassword
        } : undefined
    });

    await transporter.sendMail({
        from: mailOptions.emailFrom,
        to: mailOptions.emailTo,
        subject: subject,
        html: shouldUseHTML ? body : undefined,
        text: shouldUseHTML ? undefined : body
    });
}
