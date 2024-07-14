import Joi from "joi";

export const playerImageValidation = Joi.object<PlayerImageRequest>({
    id: Joi.number().required(),
    index: Joi.number().required()
})

export interface PlayerImageRequest {
    id: number,
    index: number
}