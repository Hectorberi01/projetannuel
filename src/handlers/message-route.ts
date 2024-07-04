import express from "express";
import {EmailUseCase} from "../domain/email-usecase";
import {AppDataSource} from "../database/database";
import {listEmailsValidation} from "./validator/email-validator";
import {createContactValidation, idContactValidation, listContactValidation} from "./validator/contact-validator";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {ContactUseCase} from "../domain/contact-usecase";

export const messageRoute = (app: express.Express) => {

    app.get("/emails", async (req: express.Request, res: express.Response) => {

        try {
            const listRequest = listEmailsValidation.validate(req.body);
            if (listRequest.error) {
                res.status(500).send(listRequest.error);
            }

            const list = listRequest.value;

            const limit = list.limit ? list.limit : 5
            const page = list.page ? list.page : 1;
            const useCase = new EmailUseCase(AppDataSource);
            const result = await useCase.getAllEmails({...list, page, limit});
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.get("/contacts", async (req: express.Request, res: express.Response) => {
        try {
            const listRequest = listContactValidation.validate(req.body);
            if (listRequest.error) {
                res.status(500).send(listRequest.error);
            }
            const limit = listRequest.value.limit ? listRequest.value.limit : 5
            const page = listRequest.value.page ? listRequest.value.page : 1;
            const useCase = new ContactUseCase(AppDataSource);
            const result = await useCase.getAllContacts({...listRequest, page, limit});
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.delete("/contacts/:id", async (req: express.Request, res: express.Response) => {
        try {
            const idContactValidate = idContactValidation.validate(req.params);
            if (idContactValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idContactValidate.error.details));
            }
            const useCase = new ContactUseCase(AppDataSource);
            const result = await useCase.deleteContact(idContactValidate.value.id);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.post("/contacts", async (req: express.Request, res: express.Response) => {
        try {
            const createContactValidate = createContactValidation.validate(req.body);
            if (createContactValidate.error) {
                res.status(400).send(createContactValidate.error.details);
            }
            const useCase = new ContactUseCase(AppDataSource);
            const result = await useCase.createContact(createContactValidate.value);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })
}