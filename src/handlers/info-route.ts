import express, {Request, Response} from "express";
import {AppDataSource} from "../database/database";
import {listInfoValidation} from "./validator/info-validator";
import {InfoUseCase} from "../domain/info-usecase";

export const infoRoute = (app: express.Express) => {

    app.get('/health', (req, res) => {
        res.status(200).send('health');
    });

    app.get("/infos", async (req: Request, res: Response) => {
        try {
            const listvalidator = listInfoValidation.validate(req.query);
            if (listvalidator.error) {
                res.status(400).send({
                    error: "Invalid query parameters",
                    details: listvalidator.error.details
                });
                return;
            }

            const listRequest = listvalidator.value;
            const limit = listRequest.limit ?? 5;
            const page = listRequest.page ?? 1;

            const useCase = new InfoUseCase(AppDataSource);
            const listEvent = await useCase.getAllInfos({ ...listRequest, page, limit });
            res.status(200).send(listEvent);
        } catch (error) {
            res.status(500).send({ "error": "Internal error for list event, please retry later" });
        }
    });
}
