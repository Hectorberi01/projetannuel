import Joi from "joi"
import { Sport } from "../../database/entities/sport"
import { Events } from "../../database/entities/events"
import { Image } from "../../database/entities/image"


export interface ClubRequest{
    Id: number,
    Name: string,
    Address: string,
    Email:string,
    Sport: Sport[],
    events: Events[],
    Image: Image
    creation_date:Date
}

export const ClubValidator = Joi.object<ClubRequest>({
    Id: Joi.number().optional(),
    Name: Joi.string().required(),
    Address: Joi.string().required(),
    Email : Joi.string().required(),
    Sport: Joi.array().items(Joi.object()).required(), 
    events:  Joi.array().items(Joi.object()).optional(), 
    Image: Joi.object().optional(),
    creation_date: Joi.date().required(),
})

export const listClubValidation = Joi.object<ListClubRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListClubRequest {
    page?: number
    limit?: number
}

export const ClubIdValidation = Joi.object<ClubIdRequest>({
    Id: Joi.number().required(),
})

export interface ClubIdRequest {
    Id: number
}