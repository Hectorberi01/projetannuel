
import Joi from "joi"


export interface ImageRequest{
    Id: number,
    Path: Buffer,
}

export const ImageValidator = Joi.object<ImageRequest>({
    Id: Joi.number().optional(),
    Path: Joi.string().required(),

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