import Joi from "joi";

const {joiPasswordExtendCore} = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

export interface CreatePlayerRequest {
    firstName: string,
    email: string
    lastName: string,
    height: number,
    weight: number,
    birthDate: Date,
    sportId: number,
    formationCenterId: number,
    stats: string;
}


export const createPlayerValidation = Joi.object<CreatePlayerRequest>({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    height: Joi.number().optional(),
    weight: Joi.number().optional(),
    birthDate: Joi.date().required(),
    stats: Joi.string().optional(),
    sportId: Joi.number().required(),
    formationCenterId: Joi.number().optional()
})

export const listPlayerValidation = Joi.object<ListPlayerRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListPlayerRequest {
    page?: number
    limit?: number
}

export const playerIdValidation = Joi.object<PlayerIdRequest>({
    id: Joi.number().required(),
})

export interface PlayerIdRequest {
    id: number
}

export const updatePlayerValidation = Joi.object<UpdatePlayerRequest>({
    id: Joi.number().required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    height: Joi.number().optional(),
    weight: Joi.number().optional(),
    birthDate: Joi.date().optional(),
    stats: Joi.object().optional(),
    sportId: Joi.number().optional(),
    formationCenterId: Joi.number().optional()
});

export interface UpdatePlayerRequest {
    id: number;
    firstName: string;
    lastName: string;
    height: number;
    weight: number;
    birthDate: Date;
    stats: string;
    sportId: number;
    formationCenterId: number;
}
