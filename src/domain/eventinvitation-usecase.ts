import {DataSource} from "typeorm";
import {User} from "../database/entities/user";
import {EventInvitation} from "../database/entities/eventinvitation";
import {Event} from "../database/entities/event";
import {EventInvitationStatut} from "../Enumerators/EventInvitationStatut";
import {MessageUseCase} from "./message-usecase";
import {MessageType} from "../Enumerators/MessageType";
import {AppDataSource} from "../database/database";
import {EventuseCase} from "./events-usecase";
import {UseruseCase} from "./user-usecase";

export class EventInvitationUseCase {
    constructor(private readonly db: DataSource) {
    }

    async getInvitationByEventId(eventId: number): Promise<EventInvitation[]> {

        try {
            const eventUseCase = new EventuseCase(AppDataSource);
            const repo = this.db.getRepository(EventInvitation);
            const event = await eventUseCase.getEventById(eventId);

            if (!event) {
                throw new Error("Evennement inconnu");
            }
            const result = await repo.find({
                where: {event: event},
                relations: ['user']
            });

            if (!result) {
                throw new Error("Erreur lors de la récupération des invitations")
            }

            return result;
        } catch (error: any) {
            throw new Error("Erreur lors de la récupération des invitations")
        }
    }

    async createInvitation(user: User, event: Event): Promise<EventInvitation> {
        try {
            const messageUseCase = new MessageUseCase(AppDataSource);
            const repo = this.db.getRepository(EventInvitation);
            if (!user) {
                throw new Error("utilisateur inconnu");
            }
            if (!event) {
                throw new Error("Event inconnu");
            }

            let eventInvitation = new EventInvitation();
            eventInvitation.user = user;
            eventInvitation.event = event;
            eventInvitation.status = EventInvitationStatut.PENDING;

            const result = await repo.save(eventInvitation);

            if (!result) {
                throw new Error("Impossible de créer l'invitation");
            }
            await messageUseCase.sendMessage(MessageType.NEW_EVENT_ALERT, user, event);
            return result;
        } catch (error: any) {
            throw new Error("Impossible de créer l'invitation");
        }
    }

    async updateInvitation(inviteStatus: EventInvitationStatut, eventInvitationId: number): Promise<EventInvitation> {

        try {
            const repo = this.db.getRepository(EventInvitation)
            let invitation = await this.getEventInvitationById(eventInvitationId);

            if (!invitation) {
                throw new Error("Invitation inconnu");
            }

            invitation.status = inviteStatus;
            return await repo.save(invitation);
        } catch (error: any) {
            throw new Error("Impossible de mettre à jour cette invitation");
        }
    }

    async getEventInvitationById(id: number): Promise<EventInvitation> {
        const repo = this.db.getRepository(EventInvitation);

        const invite = await repo.findOne({
            where: {id: id}
        });

        if (!invite) {
            throw new Error(`Invitation with id ${id} not found`);
        }

        return invite;
    }

    async getInvitationByUserId(userId: number): Promise<EventInvitation[]> {

        try {
            const userUseCase = new UseruseCase(AppDataSource);
            const user = await userUseCase.getUserById(userId);
            if (!user) {
                throw new Error("Utilisateur inconnu");
            }
            const repo = this.db.getRepository(EventInvitation);
            return await repo.find({
                where: {user: user},
                relations: {
                    event: true
                }
            })
        } catch (error) {
            throw error
        }
    }
}