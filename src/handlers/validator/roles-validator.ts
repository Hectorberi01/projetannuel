import Joi from "joi"


export interface CreateRoleRequest {
    id: number,
    role: string,
}

export const createRoleValidation = Joi.object<CreateRoleRequest>({
    id: Joi.number().optional(),
    role: Joi.string().required(),

})

export const listRoleValidation = Joi.object<ListRoleRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListRoleRequest {
    page?: number
    limit?: number
}

export const SportIdValidation = Joi.object<RoleIdRequest>({
    id: Joi.number().required(),
})

export interface RoleIdRequest {
    id: number
}