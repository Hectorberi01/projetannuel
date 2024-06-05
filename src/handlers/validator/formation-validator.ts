import Joi from "joi"
import { Sport } from "../../database/entities/sport"


export interface FormationCenterRequest{
    Id: number,
    Name: string,
    Adress: string,
    Sports: Sport[],
    Email: string,
    Id_Image: number
    Creation_Date:Date
}

export const FormationCenterValidator = Joi.object<FormationCenterRequest>({
    Id: Joi.number().optional(),
    Name: Joi.string().required(),
    Adress: Joi.string().required(),
    Email: Joi.string().required(),
    Sports: Joi.array().items(Joi.object()).required(), 
    Id_Image: Joi.number().optional(),
    Creation_Date: Joi.date().default(new Date(Date.now())),
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