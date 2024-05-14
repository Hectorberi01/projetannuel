import Joi, { number } from "joi";
import { Sport } from "../../database/entities/sport";
import { FormationCenter } from "../../database/entities/formationcenter";
import {Image} from '../../database/entities/image'
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

export interface PlayerRequest{
    Id: number,
    FirstName: string,
    LastName: string,
    Height: number,
    Weight: number,
    Birth_Date: Date,
    Sport: Sport,
    FormationCenter: FormationCenter,
    Image : Image,
    stats: object;
}


export const PlayerValidator = Joi.object<PlayerRequest>({
    Id: Joi.number().optional(),
    FirstName: Joi.string().required(),
    LastName: Joi.string().required(),
    Height: Joi.number().required(),
    Weight:Joi.number().required(),
    Birth_Date: Joi.date().required(),
    stats: Joi.object().optional(),
    Sport: Joi.object().required(), 
    FormationCenter: Joi.object().required(), 
    Image : Joi.object().optional(), 
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
