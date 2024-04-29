import Joi from "joi"
import { User } from "../../database/entities/useraccount"


export interface VoteRequest{
    Id: number,
    Description: string,
    Timeat: Date,
    Creation_Date:Date
    Users: User[],
}

export const VoteValidator = Joi.object<VoteRequest>({
    Id: Joi.number().optional(),
    Description: Joi.string().required(),
    Timeat: Joi.date().required(),
    Creation_Date: Joi.date().required(),
    Users: Joi.array().items(Joi.object()).optional(), 
})

export const listVoteValidation = Joi.object<ListVoteRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListVoteRequest {
    page?: number
    limit?: number
}

export const VoteIdValidation = Joi.object<VoteIdRequest>({
    Id: Joi.number().required(),
})

export interface VoteIdRequest {
    Id: number
}

export const AsignVoteUserValidation = Joi.object<AssignVoteRequest>({
    Id_user : Joi.number().required(),
   // Id_vote : Joi.number().required(),
})

export interface AssignVoteRequest{
    Id_user : number,
    //Id_vote : number
}
