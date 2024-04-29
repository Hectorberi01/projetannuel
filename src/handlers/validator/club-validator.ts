import Joi from "joi"
import { Sport } from "../../database/entities/sport"


export interface ClubRequest{
    Id: number,
    Name: string,
    Adress: string,
    Sports: Sport[],
    Id_Image: number
    creation_date:Date
}

export const ClubValidator = Joi.object<ClubRequest>({
    Id: Joi.number().optional(),
    Name: Joi.string().required(),
    Adress: Joi.string().required(),
    Sports: Joi.array().items(Joi.object()).required(), 
    Id_Image: Joi.number().optional(),
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