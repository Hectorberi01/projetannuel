import Joi from "joi";

export const listCotisationValidation = Joi.object<ListCotisationRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListCotisationRequest {
    page?: number
    limit?: number
}

export const idCotisationValidation = Joi.object<IdCotisationRequest>({
    id: Joi.number().required(),
})

export interface IdCotisationRequest {
    id: number
}