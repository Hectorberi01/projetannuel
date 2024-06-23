import Joi from "joi"
import {User} from "../../database/entities/user";
import {Club} from "../../database/entities/club";
import {FormationCenter} from "../../database/entities/formationcenter";


export interface CreateEventRequest {
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    lieu: string,
    type: string,
    clubs: Club[];
    trainingCenters: FormationCenter[];
    users: User[]
}

export const createEventValidation = Joi.object<CreateEventRequest>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    lieu: Joi.string().optional(),
    type: Joi.string().optional(),
    clubs: Joi.array().optional(),
    trainingCenters: Joi.array().optional(),
    users: Joi.array().optional(),
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
    id: Joi.number().required(),
})

export interface EventIdRequest {
    id: number
}