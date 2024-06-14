import Joi from "joi"
import {Sport} from "../../database/entities/sport"


export interface FormationCenterRequest {
    name: string,
    address: string,
    sports: Sport[],
    email: string,
}

export const FormationCenterValidator = Joi.object<FormationCenterRequest>({
    name: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().required(),
    sports: Joi.array().items(Joi.object()).required(),
})

export const listFormationCenterValidation = Joi.object<ListFormationCenterRequesRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListFormationCenterRequesRequest {
    page?: number
    limit?: number
}

export const FormationCenterIdValidation = Joi.object<FormationCenterIdRequest>({
    id: Joi.number().required(),
})

export interface FormationCenterIdRequest {
    id: number
}