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
                break;
            case MessageType.REMINDER_COTISATION:
                break;
            case MessageType.DELETE_COTISATION:
                break;
            default:
                throw new Error('Unknown message type');
        }
        await emailUseCase.createEmail(user, messageType);
    }

    private async createFirstConnectionMessage(user: any, tmpPassword: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.FIRST_CONNECTION);
        if (!template) {
            throw new Error("Template non trouvé");
        }

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

        const eventDetails = extraData.eventDetails;

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: template.subject,
            text: mustache.render(template.body, {...user, ...eventDetails}),
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

    private async createCanceledEventAlertMessage(user: any, extraData: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.CANCELED_EVENT_ALERT);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        const eventTitle = extraData.title;
        const eventDateTime = extraData.startDate.toLocaleString();

        return {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TEST,
            subject: mustache.render(template.subject, {eventTitle}),
            text: mustache.render(template.body, {
                ...user,
                eventTitle,
                eventDateTime
            }),
        };
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
}