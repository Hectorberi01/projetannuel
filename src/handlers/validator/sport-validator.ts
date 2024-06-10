import Joi from "joi"


export interface CreateSportRequest{
    name: string,
}

export const createSportValidation = Joi.object<CreateSportRequest>({
    name: Joi.string().required(),

})

export const listSportValidation = Joi.object<ListSportRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListSportRequest {
    page?: number
    limit?: number
}

export const idSportValidation = Joi.object<IdSportRequest>({
    id: Joi.number().required(),
})

export interface IdSportRequest {
    id: number
}