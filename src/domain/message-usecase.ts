import nodemailer from 'nodemailer';
import mustache from 'mustache';
import {MessageType} from '../Enumerators/MessageType';
import {MessageTemplate} from '../database/entities/messagetemplate';
import {User} from '../database/entities/user';
import {sendDelayedMessage} from '../middlewares/rabbitmq';
import dotenv from 'dotenv';
import {EmailUseCase} from "./email-usecase";
import {AppDataSource} from "../database/database";
import {DataSource} from "typeorm";
import {Cotisation} from "../database/entities/cotisation";

dotenv.config();

export class MessageUseCase {

    private db: DataSource;
    private transporter: nodemailer.Transporter;

    constructor(db: DataSource) {
        this.db = db;

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendMessage(messageType: MessageType, user: User, extraData?: any): Promise<void> {
        let mailOptions;
        const emailUseCase = new EmailUseCase(AppDataSource);

        switch (messageType) {
            case MessageType.FIRST_CONNECTION:
                mailOptions = await this.createFirstConnectionMessage(user, extraData);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.A2F_CODE:
                mailOptions = await this.createA2FCodeMessage(user, extraData);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.NEW_EVENT_ALERT:
                mailOptions = await this.createNewEventAlertMessage(user, extraData);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), extraData.delay || 0);
                break;
            case MessageType.CANCELED_EVENT_ALERT:
                mailOptions = await this.createCanceledEventAlertMessage(user, extraData);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.PASSWORD_CHANGED:
                mailOptions = await this.createPasswordChangedMessage(user);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.NEWSLETTER:
                mailOptions = await this.createNewsletterMessage(user, extraData.subject, extraData.text);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.CREATE_COTISATION:
                mailOptions = await this.createCreatedCotisationMessage(user, extraData);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.REMINDER_COTISATION:
                mailOptions = await this.createReminderCotisationMessage(user, extraData);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.DELETE_COTISATION:
                mailOptions = await this.createDeleteCotisationMessage(user);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.PAYMENT_COTISATION:
                mailOptions = await this.createPaymentCotisationMessage(user);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.CARD_CREATED:
                mailOptions = await this.createCardCotisationMessage(user);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.USER_DEACTIVATE:
                mailOptions = await this.createUserDeactivateMessage(user);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.USER_REACTIVATE:
                mailOptions = await this.createUserReactivateMessage(user);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            case MessageType.LOST_PASSWORD:
                mailOptions = await this.createLostPasswordMessage(user, extraData);
                await sendDelayedMessage('email_queue', JSON.stringify(mailOptions), 0);
                break;
            default:
                throw new Error('Unknown message type');
        }
        // @ts-ignore
        await emailUseCase.createEmail(user, messageType, mailOptions.text);
    }

    private async createFirstConnectionMessage(user: any, tmpPassword: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.FIRST_CONNECTION);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        tmpPassword = await this.escapeHtml(tmpPassword);

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {...user, tmpPassword}),
        };
    }

    private async createA2FCodeMessage(user: any, a2fCode: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.A2F_CODE);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {...user, a2fCode}),
        };
    }

    private async createNewsletterMessage(user: any, subject: any, text: any): Promise<nodemailer.SendMailOptions> {

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: subject,
            text: text,
        }
    }

    private async createNewEventAlertMessage(user: any, extraData: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.NEW_EVENT_ALERT);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {...user, ...extraData}),
        };
    }

    private async createPasswordChangedMessage(user: User): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.PASSWORD_CHANGED);
        if (!template) {
            throw new Error("Template non trouvé")
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {...user}),
        }
    }

    private async createCanceledEventAlertMessage(user: any, event: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.CANCELED_EVENT_ALERT);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: mustache.render(template.subject, {event}),
            text: mustache.render(template.body, {user, event}),
        };
    }

    private async createCardCotisationMessage(user: User): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.CARD_CREATED)
        if (!template) {
            throw new Error("Template non trouvé")
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {user})
        }
    }

    private async createReminderCotisationMessage(user: User, extraData: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.REMINDER_COTISATION);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        const cotisation: Cotisation = extraData;
        const daysLeft = Math.ceil((cotisation.limitDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {user, cotisation, daysLeft})
        };
    }

    private async createDeleteCotisationMessage(user: User): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.DELETE_COTISATION);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {user})
        }
    }

    private async createCreatedCotisationMessage(user: User, extraData: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.CREATE_COTISATION);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        const cotisation: Cotisation = extraData.cotisation;

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {user, cotisation})
        };
    }

    private async createPaymentCotisationMessage(user: User): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.PAYMENT_COTISATION);
        if (!template) {
            throw new Error("Template non trouvé")
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {user})
        }
    }

    private async createUserDeactivateMessage(user: User): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.USER_DEACTIVATE);
        if (!template) {
            throw new Error("Template non trouvé")
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {user})
        }
    }

    private async createUserReactivateMessage(user: User): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.USER_DEACTIVATE);
        if (!template) {
            throw new Error("Template non trouvé")
        }

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {user})
        }
    }

    private async createLostPasswordMessage(user: User, password: string): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.LOST_PASSWORD);
        if (!template) {
            throw new Error("Template non trouvé")
        }

        password = await this.escapeHtml(password)

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {user, password})
        }
    }

    public async sendEmail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    reject(error);
                } else {
                    console.log('Email sent:', info.response);
                    resolve();
                }
            });
        });
    }

    private async getTemplate(messageType: MessageType): Promise<MessageTemplate> {
        const templateRepository = this.db.getRepository(MessageTemplate);
        const template = await templateRepository.findOne({where: {type: messageType}});

        if (!template) {
            throw new Error("Template inconnu");
        } else {
            return template
        }
    }

    async escapeHtml(unsafe: string): Promise<string> {
        return unsafe.replace(/[&<"'>]/g, function (match) {
            const escapeChars: { [key: string]: string } = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return escapeChars[match];
        });
    }
}