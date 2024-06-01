import Joi from "joi"
import {User} from "../../database/entities/useraccount"


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
    id: Joi.number().required(),
})

export interface IdSondageRequest {
    id: number
}

export const voteSondageValidation = Joi.object<VoteSondageRequest>({
    idSondage: Joi.number().required(),
    idUser: Joi.number().required(),
    idQuestion: Joi.number().required(),
})

export interface VoteSondageRequest {
    idSondage: number,
    idUser: number,
    idQuestion: number
}

export const userAlreadyVoted = Joi.object<UserAlreadyVotedRequest>({
    idSondage: Joi.number().required(),
    idUser: Joi.number().required(),
})

export interface UserAlreadyVotedRequest {
    idSondage: number,
    idUser: number,
}