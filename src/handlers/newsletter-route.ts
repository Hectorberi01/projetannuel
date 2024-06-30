import express, {Request, Response} from "express";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {createNewsletterValidation} from "./validator/newsletter-validator";
import {NewsletterUsecase} from "../domain/newsletter-usecase";
import {AppDataSource} from "../database/database";


export const newsletterRoute = (app: express.Express) => {

    app.put("/newsletter/send", async (req: Request, res: Response) => {
        try {
            const createNewsletterValidate = createNewsletterValidation.validate(req.body)

            if (createNewsletterValidate.error) {
                res.status(400).send(generateValidationErrorMessage(createNewsletterValidate.error.details))
            }

            const newsletterUseCase = new NewsletterUsecase(AppDataSource);
            const result = await newsletterUseCase.sendNewsletterToUser(createNewsletterValidate.value);
            res.status(200).send(result);
        } catch (error: any) {
            return res.status(500).json(error.message);
        }
    });
}
