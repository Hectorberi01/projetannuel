import Joi from "joi";
import {EventInvitationStatut} from "../../Enumerators/EventInvitationStatut";

export const idInvitationValidation = Joi.object<IdInvitationRequest>({
    id: Joi.number().required(),
})

export interface IdInvitationRequest {
    id: number
}

export const statusInvitationValidation = Joi.object<StatusInvitationRequest>({
    id: Joi.number().required(),
    status: Joi.string().required()
})

export interface StatusInvitationRequest {
    id: number,
    status: EventInvitationStatut
}