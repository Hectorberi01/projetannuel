import Joi from "joi"


export interface CreateQuestionRequest {
    text: string,
    sondageId: number
}

export const createQuestionValidation = Joi.object<CreateQuestionRequest>({
    text: Joi.string().required(),
    sondageId: Joi.number().required(),
})
