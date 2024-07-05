import Joi from "joi";


export interface ListContactRequest {
    limit?: number,
    page?: number,
    role?: string,
    name?: string,
    email?: string
    subject?: string
}

export const listContactValidation = Joi.object<ListContactRequest>({
    limit: Joi.number().min(1).optional(),
    page: Joi.number().min(1).optional(),
    role: Joi.string().optional(),
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    subject: Joi.string().optional(),
})

export interface CreateContactRequest {
    role?: string,
    name: string,
    email: string,
    subject: string,
    content: string
}

export const createContactValidation = Joi.object<CreateContactRequest>({
    role: Joi.string().optional(),
    name: Joi.string().required(),
    email: Joi.string().required(),
    subject: Joi.string().required(),
    content: Joi.string().required(),
})

export interface IdContactRequest {
    id: number
}

export const idContactValidation = Joi.object<IdContactRequest>({
    id: Joi.number().required(),
})