import Joi from "joi";


export interface CreateDocumentRequest {
    file: File
}

export const createDocumentValidation = Joi.object<CreateDocumentRequest>({
    file: Joi.object().required()
})

export interface IdDocumentRequest {
    id: number
}

export const idDocumentValidation = Joi.object<IdDocumentRequest>({
    id: Joi.number().required(),
})

export interface ListDocumentRequest {
    page: number
    limit: number
}

export const listDocumentValidation = Joi.object<ListDocumentRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})