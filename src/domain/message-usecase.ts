import nodemailer from 'nodemailer';
import mustache from 'mustache';
import {MessageType} from '../Enumerators/MessageType';
import { MessageTemplate } from '../database/entities/messagetemplate';
import { User } from '../database/entities/user';

export class MessageUseCase {

    private db: any;
    private transporter: nodemailer.Transporter;

    constructor(db: any) {
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

        switch (messageType) {
            case MessageType.FIRST_CONNECTION:
                mailOptions = await this.createFirstConnectionMessage(user, extraData);
                break;
            case MessageType.A2F_CODE:
                mailOptions = await this.createA2FCodeMessage(user, extraData);
                break;
            case MessageType.NEW_EVENT_ALERT:
                mailOptions = await this.createNewEventAlertMessage(user, extraData);
                break;
            case MessageType.CANCELED_EVENT_ALERT:
                mailOptions = await this.createCanceledEventAlertMessage(user, extraData);
                break;
            default:
                throw new Error('Unknown message type');
        }

        await this.sendEmail(mailOptions);
    }

    private async createFirstConnectionMessage(user: any, tmpPassword: any): Promise<nodemailer.SendMailOptions> {
        const template = await this.getTemplate(MessageType.FIRST_CONNECTION);
        if (!template) {
            throw new Error("Template non trouvé");
        }

        return {
            from: process.env.EMAIL_USER,
            to: "ethanfrancois0@gmail.com",
            subject: template.subject,
            text: mustache.render(template.body, {...user, tmpPassword}),
            /*text: `Bonjour ${user.firstname},\n\nVotre compte pour accéder à notre plateforme a bien été créé.\n\nVotre identifiant est : ${user.email}\n\nVoici votre mot de passe temporaire: ${tmpPassword}\n\nVeillez à bien changer votre mot de passe lors de votre première connexion.\n\nL'équipe SportVision`,*/
        };
    }

    private async createA2FCodeMessage(user: any, a2fCode: any): Promise<nodemailer.SendMailOptions> {
        return {
            from: process.env.EMAIL_USER,
            to: "ethanfrancois0@gmail.com",
            subject: 'Votre code de validation 2FA',
            text: `Bonjour ${user.firstname},\n\nVoici votre code de validation 2FA: ${a2fCode}\n\nL'équipe SportVision`,
        };
    }

    private async createNewEventAlertMessage(user: any, extraData: any): Promise<nodemailer.SendMailOptions> {
        const eventDetails = extraData.eventDetails;
        return {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Nouvel événement SportVision',
            text: `Bonjour ${user.firstname},\n\nUn nouvel événement a été ajouté : ${eventDetails.title}.\n\nL'équipe SportVision`,
        };
    }

    private async createCanceledEventAlertMessage(user: any, extraData: any): Promise<nodemailer.SendMailOptions> {
        const eventDetails = extraData.eventDetails;
        return {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Événement annulé SportVision',
            text: `Bonjour ${user.firstname},\n\nL'événement suivant a été annulé : ${eventDetails.title}.\n\nL'équipe SportVision`,
        };
    }

    private async sendEmail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
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
        return await templateRepository.findOne({where: {type: messageType}});
    }
}
