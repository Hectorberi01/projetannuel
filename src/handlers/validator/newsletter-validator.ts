import Joi from "joi";

export interface CreateNewsletterRequest {
    subject: string,
    text: string
}

export const createNewsletterValidation = Joi.object<CreateNewsletterRequest>({
    subject: Joi.string().required(),
    text: Joi.string().required(),
})