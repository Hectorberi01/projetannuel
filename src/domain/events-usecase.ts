import {DataSource, DeleteResult, EntityNotFoundError} from "typeorm";
import {EventRequest} from "../handlers/validator/events-validator";
import {Event} from "../database/entities/event";
import {EventStatut} from "../Enumerators/EventStatut";
import {MessageUseCase} from "./message-usecase";
import {AppDataSource} from "../database/database";
import {MessageType} from "../Enumerators/MessageType";


export interface ListEventUseCase {
    limit: number;
    page: number;
}

export class EventuseCase {
    constructor(private readonly db: DataSource) {
    }

    async getAllEvents(listevent: ListEventUseCase): Promise<{ events: Event[], total: number }> {
        const query = this.db.getRepository(Event).createQueryBuilder('Event')
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

    async createEvent(eventData: EventRequest) {
        try {
            const eventRepository = this.db.getRepository(Event);
            const newEvent = new Event();

            newEvent.title = eventData.title;
            newEvent.description = eventData.description;
            newEvent.startDate = eventData.startDate;
            newEvent.endDate = eventData.endDate;
            newEvent.lieu = eventData.lieu;
            newEvent.recurrence = eventData.recurrence;
            newEvent.activity = eventData.activity
            newEvent.clubs = eventData.clubs; // les club
            newEvent.participants = eventData.participants // les utilisateurs
            newEvent.trainingCenters = eventData.trainingCenters // les centres de formations
            newEvent.capacity = eventData.capacity
            newEvent.statut = eventData.statut
            newEvent.type = eventData.type

            const result = await eventRepository.save(newEvent);
            if (result != null) {
                return result;
            } else {
                return
            }
        } catch (error) {
            console.log("erreur")
            return
        }

    }

    async getEventById(idevent: number): Promise<Event> {
        console.log("eventid", idevent)
        const eventRepository = this.db.getRepository(Event);

        const event = await eventRepository.findOne({
            where: {id: idevent},
            relations: ['participants', 'clubs', 'trainingCenters']
        });
        console.log("event", event)
        if (!event) {
            throw new EntityNotFoundError(Event, idevent);
        }
        return event;
    }

    async deleteEvent(eventid: number): Promise<DeleteResult> {

        const eventRepository = this.db.getRepository(Event);

        try {
            const event = await eventRepository.findOne({
                where: {id: eventid},
                relations: ['participants', 'clubs', 'trainingCenters']
            });

            if (!event) {
                throw new Error(`Event with ID ${eventid} not found`);
            }

            return await eventRepository.delete(eventid);
        } catch (error) {
            console.error("Failed to delete event with ID:", eventid, error);
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
}