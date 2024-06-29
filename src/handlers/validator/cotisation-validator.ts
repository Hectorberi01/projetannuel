import Joi from "joi";
import {CotisationStatus} from "../../Enumerators/CotisationStatus";

export const listCotisationValidation = Joi.object<ListCotisationRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListCotisationRequest {
    page?: number
    limit?: number
}

export const idCotisationValidation = Joi.object<IdCotisationRequest>({
    id: Joi.number().required(),
})

export interface IdCotisationRequest {
    id: number
}

export const statusCotisationValidation = Joi.object<StatusCotisationRequest>({
    id: Joi.number().required(),
    status: Joi.string().valid(...Object.values(CotisationStatus)).required(),
})

export interface StatusCotisationRequest {
    id: number,
    status: CotisationStatus
}