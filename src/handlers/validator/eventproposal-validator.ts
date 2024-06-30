import Joi from "joi";

export interface CreateEventProposalRequest {
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    place: string,
    clubId: number;
    formationCenterId: number;
    createdById: number
    playerId: number
}

export const createEventProposalValidation = Joi.object<CreateEventProposalRequest>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    place: Joi.string().required(),
    clubId: Joi.number().optional(),
    formationCenterId: Joi.number().optional(),
    createdById: Joi.number().required(),
    playerId: Joi.number().required(),
})

export const listEventProposalValidation = Joi.object<ListEventProposalRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListEventProposalRequest {
    page?: number
    limit?: number
}

export const EventProposalIdValidation = Joi.object<EventProposalIdRequest>({
    id: Joi.number().required(),
})

export interface EventProposalIdRequest {
    id: number
}