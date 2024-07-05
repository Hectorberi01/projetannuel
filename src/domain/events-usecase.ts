import {DataSource, DeleteResult, EntityNotFoundError} from "typeorm";
import {CreateEventRequest} from "../handlers/validator/events-validator";
import {Event} from "../database/entities/event";
import {EventStatut} from "../Enumerators/EventStatut";
import {MessageUseCase} from "./message-usecase";
import {AppDataSource} from "../database/database";
import {MessageType} from "../Enumerators/MessageType";
import {EventInvitationUseCase} from "./eventinvitation-usecase";
import {User} from "../database/entities/user";
import {ClubUseCase} from "./club-usecase";
import {FormationCenterUseCase} from "./formationcenter-usecase";
import {EventProposalUseCase} from "./eventproposal-usecase";
import {EventProposal} from "../database/entities/eventProposal";


export interface ListEventUseCase {
    limit: number;
    page: number;
}

export class EventuseCase {
    constructor(private readonly db: DataSource) {
    }

    async getAllEvents(listevent: ListEventUseCase): Promise<{ events: Event[], total: number }> {
        const query = this.db.getRepository(Event).createQueryBuilder('event')
            .leftJoinAndSelect('event.clubs', 'club')
            .leftJoinAndSelect('event.trainingCenters', 'trainingCenter')
            .skip((listevent.page - 1) * listevent.limit)
            .take(listevent.limit);

        console.log('Executing query:', query.getQuery());

        try {
            const [events, total] = await query.getManyAndCount();
            console.log('Query result:', events, total);
            return {
                events,
                total
            };
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    async createEvent(eventData: CreateEventRequest) {
        try {
            const eventRepository = this.db.getRepository(Event);
            const newEvent = new Event();

            newEvent.title = eventData.title;
            newEvent.description = eventData.description;
            newEvent.startDate = eventData.startDate;
            newEvent.endDate = eventData.endDate;
            newEvent.lieu = eventData.lieu;
            newEvent.clubs = eventData.clubs;
            newEvent.trainingCenters = eventData.trainingCenters
            newEvent.statut = EventStatut.ACTIF
            newEvent.type = eventData.type

            let result = await eventRepository.save(newEvent);

            if (!result) {
                throw new Error("Impossible de créer cet événement");
            }

            return await this.fillUpInvitedUsers(newEvent, eventData.users);
        } catch (error) {
            throw new Error("Impossible de créer cet événement");
        }
    }

    async fillUpInvitedUsers(newEvent: Event, users: User[]): Promise<Event> {
        try {
            const eventRepository = this.db.getRepository(Event);
            const invitationUseCase = new EventInvitationUseCase(AppDataSource);
            const clubUseCase = new ClubUseCase(AppDataSource);
            const fcUseCase = new FormationCenterUseCase(AppDataSource);
            let invitedUsers: Set<User> = new Set();

            if (newEvent.clubs != null && newEvent.clubs.length > 0) {
                for (let club of newEvent.clubs) {
                    club = await clubUseCase.getClubById(club.id);
                    for (const user of club.users) {
                        invitedUsers.add(user);
                    }
                }
            }

            if (newEvent.trainingCenters != null && newEvent.trainingCenters.length > 0) {
                for (let tc of newEvent.trainingCenters) {
                    tc = await fcUseCase.getFormationCenterById(tc.id);
                    for (const user of tc.users) {
                        invitedUsers.add(user);
                    }
                }
            }

            if (users != null && users.length > 0) {
                for (const user of users) {
                    invitedUsers.add(user);
                }
            }

            if (invitedUsers.size > 0) {
                for (const user of invitedUsers) {
                    await invitationUseCase.createInvitation(user, newEvent);
                }
                newEvent.participants = Array.from(invitedUsers);
                newEvent = await eventRepository.save(newEvent);
            }

            return newEvent;
        } catch (error) {
            console.error("Erreur lors de l'invitation des participants:", error);
            throw new Error("Impossible d'inviter les participants");
        }
    }

    async getEventById(idevent: number): Promise<Event> {
        console.log("eventid", idevent)
        const eventRepository = this.db.getRepository(Event);

        const event = await eventRepository.findOne({
            where: {id: idevent},
            relations: ['participants', 'clubs', 'trainingCenters', 'invitations']
        });
        console.log("event", event)
        if (!event) {
            throw new EntityNotFoundError(Event, idevent);
        }
        return event;
    }

    async deleteEvent(eventId: number): Promise<DeleteResult> {

        const eventRepository = this.db.getRepository(Event);
        const messageUseCase = new MessageUseCase(AppDataSource);

        try {
            const event = await this.getEventById(eventId);

            if (!event) {
                throw new Error(`Event with ID ${eventId} not found`);
            }

            const result = await eventRepository.delete(eventId);

            if (!result) {
                throw new Error("Impossible de supprimer cet evenement");
            }

            for (const user of event.participants) {
                await messageUseCase.sendMessage(MessageType.CANCELED_EVENT_ALERT, user, event);
            }

            return result;
        } catch (error) {
            console.error("Failed to delete event with ID:", eventId, error);
            throw error;
        }

    }

    async updateEvent(eventid: number, info: any) {
        try {
            const eventRepository = this.db.getRepository(Event)
            console.log("info", info)
            const result = await this.getEventById(eventid)
            console.log("result", result)
            if (result instanceof Event) {
                const event = result;
                console.log("user = result", event)
                Object.assign(event, info);
                console.log("user", event)
                await eventRepository.save(event)
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error("Failed to update user with ID:", eventid, error);
        }
    }

    async getRecentsEvents(): Promise<Event[]> {
        const eventRepository = this.db.getRepository(Event);
        return await eventRepository.find({
            order: {
                id: 'DESC'
            },
            take: 3
        });
    }

    async cancelEvent(eventId: number): Promise<Event> {
        try {
            const messageUseCase = new MessageUseCase(AppDataSource);
            const eventRepository = this.db.getRepository(Event);
            const event = await this.getEventById(eventId);
            if (!event) {
                throw new Error("Evenement non trouvé");
            }
            event.statut = EventStatut.CANCELED;
            const result = await eventRepository.save(event);
            if (!result) {
                throw new Error("Erreur d'annulation de l'évenement");
            }

            for (let user of event.participants) {
                await messageUseCase.sendMessage(MessageType.CANCELED_EVENT_ALERT, user, event);
            }
            return event;
        } catch (error: any) {
            throw new Error("Erreur lors de l'annulation de l'évennement");
        }
    }

    async createFromEventProposal(eventProposalId: number): Promise<Event> {
        try {
            const eventProposalUseCase = new EventProposalUseCase(AppDataSource);
            const eventProposal = await eventProposalUseCase.getEventProposalById(eventProposalId);
            if (!eventProposal) {
                throw new EntityNotFoundError(EventProposal, eventProposalId);
            }

            let event: CreateEventRequest = {
                title: eventProposal.title,
                description: eventProposal.description,
                startDate: eventProposal.startDate,
                endDate: eventProposal.endDate,
                lieu: eventProposal.place,
                type: "Rencontre",
                clubs: [eventProposal.club],
                trainingCenters: [],
                users: [eventProposal.player.user]
            }

            const result = await this.createEvent(event);

            if (!result) {
                throw new Error("Impossible de créer cet evenement");
            }
            await eventProposalUseCase.deleteEventProposal(eventProposal.id);
            return result;
        } catch (error) {
            throw new Error();
        }
    }
}