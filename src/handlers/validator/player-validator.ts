import Joi, { number } from "joi";
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

export interface PlayerRequest{
    Id: number,
    FirstName: string,
    LastName: string,
    Birth_Date: Date,
    Id_Sport: number,
    Id_Formationcenter: number,
    Id_Image: number,
}


export const PlayerValidator = Joi.object<PlayerRequest>({
    Id: Joi.number().optional(),
    FirstName: Joi.string().required(),
    LastName: Joi.string().required(),
    Birth_Date: Joi.date().required(),
    Id_Sport: Joi.number().integer().required(),
    Id_Formationcenter: Joi.number().integer().required(),
    Id_Image: Joi.number().optional(),
})

export const listPlayerValidation = Joi.object<ListPlayerRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListPlayerRequest {
    page?: number
    limit?: number
}

export const PlayerIdValidation = Joi.object<PlayerIdRequest>({
    Id: Joi.number().required(),
})

export interface PlayerIdRequest {
    Id: number
}
