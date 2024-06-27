import Joi from "joi";

export const listTransactionValidation = Joi.object<ListTransactionsRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
})

export interface ListTransactionsRequest {
    page?: number
    limit?: number
}