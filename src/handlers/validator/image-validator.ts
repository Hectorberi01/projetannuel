
import Joi from "joi"
import { User } from "../../database/entities/useraccount";
import { Club } from "../../database/entities/club";
import { Player } from "../../database/entities/player";


export interface ImageRequest{
    Id: number,
    url: string,
    user: User;
    club: Club;
    players: Player;
}

export const ImageValidator = Joi.object<ImageRequest>({
    Id: Joi.number().optional(),
    url: Joi.string().required(),
    players: Joi.array().items(Joi.object()).optional(),
    club : Joi.object().optional(),
    user: Joi.object().optional(),
})

export const listImagevalidation = Joi.object<ListImageRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListImageRequest {
    page?: number
    limit?: number
}

export const ImageIdValidation = Joi.object<ListImageIdRequest>({
    Id: Joi.number().required(),
})

export interface ListImageIdRequest {
    Id: number
}