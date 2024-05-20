import Joi from "joi"
import { User } from "../../database/entities/useraccount";
import { Club } from "../../database/entities/club";
import { FormationCenter } from "../../database/entities/formationcenter";


export interface EventRequest{
    id:number,
    title : string, 
    description: string, 
    startDate: Date, 
    endDate: Date,
    recurrence: string,
    lieu: string,
    capacity: number,
    type: string,
    activity :string,
    statut:string,
    participants: User[];
    clubs: Club[];
    trainingCenters: FormationCenter[];
}

export const EventValidator = Joi.object<EventRequest>({
    id: Joi.number().optional(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    recurrence: Joi.string().optional(),
    statut: Joi.string().optional(),
    lieu: Joi.string().optional(),
    activity: Joi.string().optional(),
    capacity: Joi.number().integer().required(),
    type: Joi.string().optional(),
    participants:Joi.array().items(Joi.object()).optional(),
    clubs:Joi.array().items(Joi.object()).optional(),
    trainingCenters:Joi.array().items(Joi.object()).optional(),
})

export const listEventValidation = Joi.object<ListEventRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListEventRequest {
    page?: number
    limit?: number
}

export const EventIdValidation = Joi.object<EventIdRequest>({
    Id: Joi.number().required(),
})

export interface EventIdRequest {
    Id: number
}