import Joi, { number } from "joi";
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

export interface UserRequest{
    Id: number,
    FirstName: string,
    LastName: string,
    Email: string,
    Birth_Date: Date,
    Creation_Date: Date,
    Adress: string,
    Id_Roles: number,
    Id_Image: number,
    Matricule: number,
    Password: string,
}

export const UserValidator = Joi.object<UserRequest>({
    Id: Joi.number().optional(),
    FirstName: Joi.string().required(),
    LastName: Joi.string().required(),
    Email: Joi.string().email().required(),
    Birth_Date: Joi.date().required(),
    Creation_Date: Joi.date().default(new Date(Date.now())),
    Adress: Joi.string().required(),
    Id_Roles: Joi.number().integer().required(),
    Id_Image: Joi.number().optional(),
    Matricule: Joi.number().integer(),
    Password: joiPassword.string()
    .minOfSpecialCharacters(2)
    .minOfLowercase(2)
    .minOfUppercase(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .doesNotInclude(['password'])
    .required(),
})

export const listUserValidation = Joi.object<ListUserRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListUserRequest {
    page?: number
    limit?: number
}

export const UserIdValidation = Joi.object<UserIdRequest>({
    Id: Joi.number().required(),
})

export interface UserIdRequest {
    Id: number
}

export const UserLoginlValidation = Joi.object<UserEmailRequest>({
    Email: Joi.string().email(),
    Password: joiPassword.string()
    .minOfSpecialCharacters(2)
    .minOfLowercase(2)
    .minOfUppercase(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .doesNotInclude(['password'])
    .required(),
})

export interface UserEmailRequest {
    Email: string,
    Password: string,
}