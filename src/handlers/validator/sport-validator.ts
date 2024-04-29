import Joi from "joi"


export interface SportRequest{
    Id: number,
    Name: string,
}

export const SportValidator = Joi.object<SportRequest>({
    Id: Joi.number().optional(),
    Name: Joi.string().required(),

})

export const listSportalidation = Joi.object<ListSporttRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListSporttRequest {
    page?: number
    limit?: number
}

export const SportIdValidation = Joi.object<SportIdRequest>({
    Id: Joi.number().required(),
})

export interface SportIdRequest {
    Id: number
}