import { DataSource, DeleteResult, EntityNotFoundError, IsNull, Repository } from "typeorm";
import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";
import { EventRequest } from "../handlers/validator/events-validator";
import { Events } from "../database/entities/events";
import { User } from "../database/entities/useraccount";
import { FormationCenter } from "../database/entities/formationcenter";
import { Club } from "../database/entities/club";


export interface ListEventUseCase {
    limit: number;
    page: number;
}
export class EventuseCase{
    constructor(private readonly db: DataSource){}

    async Listevents(listevent: ListEventUseCase): Promise<{ events: Events[], total: number }> {
        const query = this.db.getRepository(Events).createQueryBuilder('event')
        .leftJoinAndSelect('event.participants','participants')
        .leftJoinAndSelect('event.clubs','clubs')
        .leftJoinAndSelect('event.trainingCenters','trainingCenters')
        .skip((listevent.page - 1) * listevent.limit)
        .take(listevent.limit);

        const [events, total] = await query.getManyAndCount();
        return {
            events,
            total
        };
    }


    async CreatEvent(eventData :EventRequest ){
        try{
            const eventRepository  = this.db.getRepository(Events);
            const newEvent = new Events();
    
            newEvent.Id = eventData.id;
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
            newEvent.capacity= eventData.capacity
            newEvent.statut = eventData.statut
            newEvent.type = eventData.type
            
            const result = await eventRepository.save(newEvent);
            if(result != null){
                return result;
            }else{
                return
            }
        }catch(error){
            console.log("erreur")
            return
        }
        
    }


    async getEventrById(idevent: number): Promise<Events> {
        console.log("eventid",idevent)
        const eventRepository = this.db.getRepository(Events);

        const event = await eventRepository.findOne({
            where: { Id: idevent },
            relations: ['participants', 'clubs', 'trainingCenters']
        });
        console.log("event",event)
        if (!event) {
            throw new EntityNotFoundError(Events, idevent);
        }
        return event;
    }


    async DeleteEvente(eventid : number): Promise<DeleteResult>{

        const eventRepository  = this.db.getRepository(Events);

        try {
            const event = await eventRepository.findOne({
                where: { Id: eventid },
                relations: ['participants', 'clubs', 'trainingCenters']
            });

            if(!event){
                throw new Error(`Event with ID ${eventid} not found`);
            }

            return await eventRepository.delete(eventid);
        } catch (error) {
            console.error("Failed to delete event with ID:", eventid, error);
            throw error;
        }

    }

    async upDateEventeData(eventid : number,info : any){
        try{
            const eventRepository = this.db.getRepository(Events)
            console.log("info",info)
            const result  = await this.getEventrById(eventid)
            console.log("result",result)
            if(result instanceof Events){
                const event = result;
                console.log("user = result",event)
                Object.assign(event, info);
                console.log("user",event)
               await eventRepository.save(event) 
            }else {
                throw new Error('User not found');
            }
        }catch(error){
            console.error("Failed to update user with ID:", eventid, error);
        }
    }
}