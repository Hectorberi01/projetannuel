import {Contact} from "../database/entities/contact";
import {DataSource} from "typeorm";
import {CreateContactRequest} from "../handlers/validator/contact-validator";
import {AppDataSource} from "../database/database";


export interface ListMessagesRequest {
    limit: number,
    page: number,
    role?: string,
    name?: string,
    email?: string
    subject?: string
}


export class ContactUseCase {

    constructor(private readonly db: DataSource) {
    }

    async getAllContacts(filters: ListMessagesRequest): Promise<{ contacts: Contact[], count: number }> {
        const repo = this.db.getRepository(Contact);
        const query = repo.createQueryBuilder('Contact')

        if (filters.name) {
            query.andWhere('name LIKE :name', {name: `%${filters.name}%`});
        }

        if (filters.role) {
            query.andWhere('role LIKE :role', {role: `%${filters.role}%`});
        }

        if (filters.email) {
            query.andWhere('role LIKE :role', {role: `%${filters.role}%`});
        }

        if (filters.subject) {
            query.andWhere('subject LIKE :subject', {subject: `%${filters.subject}%`});
        }

        query.skip((filters.page - 1) * filters.limit)
            .take(filters.limit);

        const [contacts, count] = await query.getManyAndCount();
        return {
            contacts,
            count
        };
    }

    async createContact(contactRequest: CreateContactRequest): Promise<Contact>     {
        const queryRunner = AppDataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const repo = queryRunner.manager.getRepository(Contact);
            let contact = new Contact();
            contact.name = contactRequest.name;
            contact.email = contactRequest.email;
            if (contactRequest.role) contact.role = contactRequest.role;
            contact.subject = contactRequest.subject;
            contact.content = contactRequest.content;
            contact.sentAt = new Date();

            const result = await repo.save(contact);
            await queryRunner.commitTransaction();
            return result;
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            throw new Error("Impossible de créer ce message: " + error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getContactById(id: number): Promise<Contact> {
        const repo = this.db.getRepository(Contact);
        const contact = await repo.findOne({where: {id: id}});
        if (!contact) {
            throw new Error("contact inconnu");
        }
        return contact;
    }

    async deleteContact(id: number): Promise<void> {
        const repo = this.db.getRepository(Contact);
        const contact = await this.getContactById(id);
        if (!contact) {
            throw new Error("contact inconnu");
        }
        await repo.delete(id);
    }
}