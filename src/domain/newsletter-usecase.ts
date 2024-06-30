import {DataSource} from "typeorm";
import {UseruseCase} from "./user-usecase";
import {AppDataSource} from "../database/database";
import {MessageUseCase} from "./message-usecase";
import {MessageType} from "../Enumerators/MessageType";
import {CreateNewsletterRequest} from "../handlers/validator/newsletter-validator";


export class NewsletterUsecase {
    constructor(private readonly db: DataSource) {
    }

    async sendNewsletterToUser(newsletterData: CreateNewsletterRequest): Promise<void> {
        try {

            const userUseCase = new UseruseCase(AppDataSource);
            const messageUseCase = new MessageUseCase(AppDataSource);
            if (!newsletterData.subject || !newsletterData.text || newsletterData.text.length == 0 || newsletterData.text.length == 0) {
                throw new Error("Impossible de créer cette newsletter");
            }
            let messageData = {
                subject: newsletterData.subject,
                text: newsletterData.text,
            }

            const users = await userUseCase.getNewsletterUsers();
            for (let user of users) {
                await messageUseCase.sendMessage(MessageType.NEWSLETTER, user, messageData);
            }
        } catch (error: any) {
            throw new Error("Erreur de l'envoie de la newsletter")
        }
    }

    async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}