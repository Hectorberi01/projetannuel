import Joi from "joi";


export interface CreatePlayerProposalRequest {
    firstName: string,
    lastName: string,
    birthDate: Date,
    email: string,
    formationCenterId: number,
    sportId: number,
    height: number,
    weight: number,
}

export const createPlayerProposalValidation = Joi.object<CreatePlayerProposalRequest>({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birthDate: Joi.date().required(),
    email: Joi.string().required(),
    formationCenterId: Joi.number().optional(),
    sportId: Joi.number().optional(),
    height: Joi.number().required(),
    weight: Joi.number().required(),
})

export const listPlayerProposalValidation = Joi.object<ListPlayerProposalRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListPlayerProposalRequest {
    page?: number
    limit?: number
}

export const idPlayerProposalValidation = Joi.object<IdPlayerProposalRequest>({
    id: Joi.number().required(),
})

export interface IdPlayerProposalRequest {
    id: number
}