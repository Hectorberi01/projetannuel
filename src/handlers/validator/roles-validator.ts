import Joi from "joi"


export interface RoleRequest{
    Id: number,
    Role: string,
}

export const RoleValidator = Joi.object<RoleRequest>({
    Id: Joi.number().optional(),
    Role: Joi.string().required(),

})

export const listSportalidation = Joi.object<ListRoleRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListRoleRequest {
    page?: number
    limit?: number
}

export const SportIdValidation = Joi.object<RoleIdRequest>({
    Id: Joi.number().required(),
})

export interface RoleIdRequest {
    Id: number
}