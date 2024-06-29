import {User} from "../database/entities/user";
import {MessageType} from "../Enumerators/MessageType";
import {Email} from "../database/entities/email";
import {DataSource} from "typeorm";
import {EmailStatus} from "../Enumerators/EmailStatus";

export class EmailUseCase {

    constructor(private readonly db: DataSource) {
    }

    async createEmail(user: User, type: MessageType): Promise<Email> {

        try {
            const repo = this.db.getRepository(Email);

            if (!user) {
                throw new Error("utilisateur inconnu");
            }
            if (!type) {
                throw new Error("Type de message inconnu");
            }

            let email = new Email();
            email.type = type;
            email.user = user;
            email.status = EmailStatus.PENDING;

            return await repo.save(email);
        } catch (error) {
            throw new Error("Impossible de créer ce mail");
        }
    }

    async getEmailById(id: number): Promise<Email> {
        try {
            const repo = this.db.getRepository(Email);
            const email = await repo.findOne({where: {id: id}});
            if (!email) {
                throw new Error("utilisateur inconnu");
            }
            return email;
        } catch (error) {
            throw new Error("Impossible de récuperer ce mail")
        }
    }

    async updateSentEmail(emailId: number): Promise<Email> {
        try {
            const repo = this.db.getRepository(Email);
            let email = await this.getEmailById(emailId);
            if (!email) {
                throw new Error("email inconnu");
            }

            email.status = EmailStatus.SENT;
            return await repo.save(email);
        } catch (error) {
            throw new Error("Impossible de mettre à jour ce mail")
        }
    }

    async getEmailsByUser(user: User): Promise<Email[]> {
        const repo = this.db.getRepository(Email);
        const result = await repo.find({
            where: {user: user}
        });

        if (!result) {
            throw new Error("Erreur lors de la récupération des mails");
        }
        return result;
    }
}