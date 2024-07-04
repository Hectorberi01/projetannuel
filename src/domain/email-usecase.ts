import {User} from "../database/entities/user";
import {MessageType} from "../Enumerators/MessageType";
import {Email} from "../database/entities/email";
import {DataSource} from "typeorm";
import {EmailStatus} from "../Enumerators/EmailStatus";

export interface ListEmailsRequest {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    email?: string;
    dateFrom?: string;
    dateTo?: string;
}

export class EmailUseCase {

    constructor(private readonly db: DataSource) {
    }

    async createEmail(user: User, type: MessageType, text: string): Promise<Email> {

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
            email.text = text;
            email.sentDate = new Date();

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

    async getAllEmails(listRequest: ListEmailsRequest): Promise<{ emails: Email[], count: number }> {
        const repo = this.db.getRepository(Email);

        const query = repo.createQueryBuilder('email')
            .leftJoinAndSelect('email.user', 'user')
            .skip((listRequest.page - 1) * listRequest.limit)
            .take(listRequest.limit);

        if (listRequest.status) {
            query.andWhere('email.status = :status', { status: listRequest.status });
        }

        if (listRequest.type) {
            query.andWhere('email.type = :type', { type: listRequest.type });
        }

        if (listRequest.email) {
            query.andWhere('user.email LIKE :email', { email: `%${listRequest.email}%` });
        }

        if (listRequest.dateFrom) {
            query.andWhere('email.sentDate >= :dateFrom', { dateFrom: listRequest.dateFrom });
        }

        if (listRequest.dateTo) {
            query.andWhere('email.sentDate <= :dateTo', { dateTo: listRequest.dateTo });
        }

        const [emails, count] = await query.getManyAndCount();

        return { emails, count };
    }
}