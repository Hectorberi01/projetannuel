import Joi from "joi";

export const listTransactionValidation = Joi.object<ListTransactionsRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    status: Joi.string().optional(),
    donorEmail: Joi.string().email().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional()
})

export interface ListTransactionsRequest {
    page?: number;
    limit?: number;
    status?: string;
    donorEmail?: string;
    dateFrom?: string;
    dateTo?: string;
}
