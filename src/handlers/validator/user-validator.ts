import Joi from "joi";

export const listUserValidation = Joi.object<ListUserRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListUserRequest {
    page?: number
    limit?: number
}

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    newsletter: boolean;
    birthDate: Date;
    roleId: string;
    playerId: string | null;
    formationCenterId: string | null;
    clubId: string | null;
}

export const createUserValidation = Joi.object<CreateUserRequest>({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    address: Joi.string().required(),
    birthDate: Joi.date().required(),
    roleId: Joi.string().required(),
    playerId: Joi.alternatives().try(Joi.string(), Joi.allow(null)).optional(),
    formationCenterId: Joi.alternatives().try(Joi.string(), Joi.allow(null)).optional(),
    clubId: Joi.alternatives().try(Joi.string(), Joi.allow(null)).optional(),
    newsletter: Joi.boolean().required()
})

export interface IdUserRequest {
    id: number
}

export const idUserValidation = Joi.object<IdUserRequest>({
    id: Joi.number().required()
})

export interface LoginUserRequest {
    login: string
    password: string
}

export const loginUserValidation = Joi.object<LoginUserRequest>({
    login: Joi.string().required(),
    password: Joi.string().required()
})
