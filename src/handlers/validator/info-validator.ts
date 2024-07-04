import Joi from "joi";
import {InfoLevel} from "../../Enumerators/InfoLevel";
import {InfoType} from "../../Enumerators/InfoType";
import {User} from "../../database/entities/user";


export interface CreateInfoRequest {
}

export const createInfoValidation = Joi.object<CreateInfoRequest>({
    type: Joi.string().valid(...Object.values(InfoType)).required(),
    level: Joi.string().valid(...Object.values(InfoLevel)).required(),
    text: Joi.string().required(),
    user: Joi.required(),
})

export interface CreateInfoRequest {
    type: InfoType,
    level: InfoLevel,
    text: string,
    user: User
}

export const listInfoValidation = Joi.object<ListInfoRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    userId: Joi.number().optional(),
    level: Joi.string().valid(...Object.values(InfoLevel)).optional(),
    type: Joi.string().valid(...Object.values(InfoType)).optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
})

export interface ListInfoRequest {
    page?: number;
    limit?: number;
    userId?: number;
    level?: string;
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export const idInfoValidation = Joi.object<IdInfoRequest>({
    id: Joi.number().required(),
})

export interface IdInfoRequest {
    id: number
}