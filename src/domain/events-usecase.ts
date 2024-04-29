import { DataSource, DeleteResult, EntityNotFoundError, IsNull } from "typeorm";
import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";
import { EventRequest } from "../handlers/validator/events-validator";
import { Events } from "../database/entities/events";


export interface ListEventUseCase {
    limit: number;
    page: number;
}
export class EventuseCase{
    constructor(private readonly db: DataSource){}

    async Listevents(listevent: ListEventUseCase): Promise<{ user: Events[], total: number }> {
        const query = this.db.getRepository(Events).createQueryBuilder('event');

        query.skip((listevent.page - 1) * listevent.limit);
        query.take(listevent.limit);

        const [user, total] = await query.getManyAndCount();
        return {
            user,
            total
        };
    }
    async CreatEvent(eventData :EventRequest ){
        const eventRepository  = this.db.getRepository(Events);
        const newEvent = new Events();

        newEvent.Id = eventData.Id;
        newEvent.Id_Image = eventData.Id_Image;
        newEvent.Importance = eventData.Importance;
        newEvent.Place = eventData.Place;
        newEvent.TimeAt = eventData.TimeAt;
        newEvent.Type = eventData.Type
        return eventRepository.save(newEvent);
    }
    async getEventrById(eventid: number): Promise<Events> {
        const eventRepository  = this.db.getRepository(Events);

        const user = await eventRepository.findOne({
            where: { Id: eventid }
        });
        if (!user) {
            throw new EntityNotFoundError(Events, eventid);
        }
        return user;
    }

    async DeleteEvente(eventid : number): Promise<DeleteResult>{

        const userRepository  = this.db.getRepository(Events);

        try {
            const result = await this.getEventrById(eventid);
            if(result == null){
                throw new Error(`${eventid} not found`);
            }

            return await userRepository.delete(eventid);
        } catch (error) {
            console.error("Failed to delete event with ID:", eventid, error);
            throw error;
        }

    }

    async upDateEventeData(eventid : number,info : any){
        try{
            const userRepository = this.db.getRepository(Events)
            console.log("info",info)
            const result  = await this.getEventrById(eventid)
            console.log("result",result)
            if(result instanceof Events){
                const event = result;
                console.log("user = result",event)
                Object.assign(event, info);
                console.log("user",event)
               await userRepository.save(event) 
            }else {
                throw new Error('User not found');
            }
        }catch(error){
            console.error("Failed to update user with ID:", eventid, error);
        }
    }
}