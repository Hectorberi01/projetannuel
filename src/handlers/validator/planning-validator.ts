import Joi from "joi"
import { User } from "../../database/entities/useraccount"


export interface PlanningRequest{
    id : number,
    titre: string,
    description: string,
    date_debut: Date,
    date_fin: Date,
    lieu: string,
    type_activite: string,
    recurrence: string,
    capacite_max: number,
    statut: string,
    users: User[]
}

export const PlanningValidator = Joi.object<PlanningRequest>({
    id: Joi.number().optional(),
    titre: Joi.string().required(),
    description: Joi.string().required(),
    date_debut: Joi.date().required(),
    date_fin: Joi.date().required(),
    lieu: Joi.string().optional(),
    type_activite: Joi.string().optional(),
    recurrence: Joi.string().optional(),
    capacite_max: Joi.number().optional(),
    statut: Joi.string().optional(),
    users: Joi.array().items(Joi.object({
        id: Joi.number().required(),
        nom: Joi.string().required(),
        email: Joi.string().email().required()
    })).optional()
})

export const listPlanningValidation = Joi.object<ListPlanningtRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListPlanningtRequest {
    page?: number
    limit?: number
}

export const PlanningIdValidation = Joi.object<PlanningIdRequest>({
    Id: Joi.number().required(),
})

export interface PlanningIdRequest {
    Id: number
}