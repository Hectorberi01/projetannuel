import Joi, { number } from "joi";
import { Roles } from "../../database/entities/roles";
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

export interface UserValidator {
    id: number,
    name: string,
    lastname: string,
    email: string,
    adress: string,
    age: number,
    password: string,
    matricule: number,
    role: Roles,
    anciennete: Date,
}

export const UserValidator = Joi.object<UserValidator>({
    id: Joi.number().optional(),
    name: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    adress: Joi.string().required(),
    age: Joi.number().integer().min(0).required(),
    password: joiPassword.string()
    .minOfSpecialCharacters(2)
    .minOfLowercase(2)
    .minOfUppercase(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .doesNotInclude(['password'])
    .required(),
    matricule: Joi.number().integer().required(),
    role: Joi.object().required(),
    anciennete: Joi.date().required()
});


export const LoginUserValidation = Joi.object<LoginUserValidationRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).options({ abortEarly: false });

export interface LoginUserValidationRequest {
    email: string
    password: string
}





