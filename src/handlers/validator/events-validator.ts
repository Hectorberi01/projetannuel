import Joi from "joi"


export interface EventRequest{
    Id: number,
    Type: string,
    Place: string,
    TimeAt: Date,
    Importance: number,
    Id_Image: number
}

export const EventValidator = Joi.object<EventRequest>({
    Id: Joi.number().optional(),
    Type: Joi.string().required(),
    Place: Joi.string().required(),
    TimeAt: Joi.date().required(),
    Importance: Joi.number().integer().required(),
    Id_Image: Joi.number().optional(),
})

export const listEventValidation = Joi.object<ListEventRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListEventRequest {
    page?: number
    limit?: number
}

export const EventIdValidation = Joi.object<EventIdRequest>({
    Id: Joi.number().required(),
})

export interface EventIdRequest {
    Id: number
}