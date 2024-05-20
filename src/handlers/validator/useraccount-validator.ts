import Joi, { number } from "joi";
import { Roles } from "../../database/entities/roles";
import { Image } from "../../database/entities/image";
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

export interface UserRequest{
    Id: number,
    firstname: string,
    lastname: string,
    email: string,
    birth_date: Date,
    creation_date: Date,
    address: string,
    roles: Roles[],
    image: Image,
    matricule: number,
    password: string,
}

export const UserValidator = Joi.object<UserRequest>({
    Id: Joi.number().optional(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    birth_date: Joi.date().required(),
    creation_date: Joi.date().default(new Date(Date.now())),
    address: Joi.string().required(),
    roles: Joi.array().items(Joi.object()).required(), 
    image: Joi.object().optional(),
    matricule: Joi.number().integer(),
    password: joiPassword.string()
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