import Joi from "joi"
import { User } from "../../database/entities/useraccount"
import { Sondage } from "../../database/entities/sondage"


export interface CreateSondageRequest {
    name: string,
    startDate: Date,
    endDate: Date,
    createdBy: User,
}

export const createSondageValidation = Joi.object<CreateSondageRequest>({
    name: Joi.string().required,
    startDate: Joi.date().required,
    endDate: Joi.date().required,
    /* createdBy = Joi.User */
})

export const listSondageValidation = Joi.object<ListSondageRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    finished: Joi.boolean().optional(),
})

export interface ListSondageRequest {
    page?: number
    limit?: number
    finished?: boolean
}

export const idSondageValidation = Joi.object<IdSondageRequest>({
    Id: Joi.number().required(),
})

export interface IdSondageRequest {
    Id: number
}