import Joi from "joi"


export interface PlanningRequest{
    Id: number,
    Description: string,
    Date_Debut: Date,
    Date_Fin: Date,
    Id_User: number
}

export const PlanningValidator = Joi.object<PlanningRequest>({
    Id: Joi.number().optional(),
    Description: Joi.string().required(),
    Date_Debut: Joi.date().required(),
    Date_Fin: Joi.date().required(),
    Id_User: Joi.number().optional(),
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