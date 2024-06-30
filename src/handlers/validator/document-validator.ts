import Joi, { string } from "joi";
import { name } from "mustache";


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
    userId : number
    page: number
    limit: number
}

export const listDocumentValidation = Joi.object<ListDocumentRequest>({
    userId: Joi.number().required(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface CreatFolderRequest{
    name : string,
    userId: number;
}

export const CreatFolderValidation = Joi.object<CreatFolderRequest>({
    name : Joi.string().required(),
    userId: Joi.number().required()
})

export interface UploadFileToFolderResquest{
    id: string,
    userId: number;
}

export const UploadFileToFolderValidation = Joi.object<UploadFileToFolderResquest>({
    id : Joi.string().required(),
    userId: Joi.number().required()
})

export interface moveFile{
    userId: number;
    fileId: string,
    folderId: string
}
export const moveFileValidation = Joi.object<moveFile>({
    userId: Joi.number().required(),
    fileId: Joi.string().required(),
    folderId: Joi.string().required(),
})