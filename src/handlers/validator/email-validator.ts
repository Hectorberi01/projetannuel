import Joi from "joi";

export const listEmailsValidation = Joi.object<ListEmailsRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    status: Joi.string().optional(),
    type: Joi.string().optional(),
    email: Joi.string().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional()
});

export interface ListEmailsRequest {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    email?: string;
    dateFrom?: string;
    dateTo?: string;
}
