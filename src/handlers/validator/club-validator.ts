import Joi from "joi"
import {Sport} from "../../database/entities/sport"
import {Event} from "../../database/entities/event"


export interface CreateClubRequest {
    name: string,
    address: string,
    email: string,
    sports: Sport[],
    events: Event[],
}

export const createClubValidation = Joi.object<CreateClubRequest>({
    name: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().required(),
    sports: Joi.array().items(Joi.object()).optional(),
    events: Joi.array().items(Joi.object()).optional(),
})

export const listClubValidation = Joi.object<ListClubRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListClubRequest {
    page?: number
    limit?: number
}

export const idClubValidation = Joi.object<IdClubRequest>({
    id: Joi.number().required(),
})

export interface IdClubRequest {
    id: number
}

export interface UpdateClubRequest {
    id: number,
    name: string,
    address: string,
    email: string,
    sports: Sport[],
    events: Event[],
}

export const updateClubValidation = Joi.object<UpdateClubRequest>({
    id: Joi.number().required(),
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    email: Joi.string().optional(),
    sports: Joi.array().items(Joi.object()).optional(),
    events: Joi.array().items(Joi.object()).optional(),
})