import express, { Request, Response, response } from "express";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { AppDataSource } from "../database/database";
import { createSondageValidation, listSondageValidation, idSondageValidation } from "./validator/sondage-validator";
import { SondageUseCase } from "../domain/sondage-usecase";


export const sondageRoutes = (app: express.Express) => {

    app.get("/healthdonts", (req: Request, res: Response) => {
        res.send({ "message": "donts" })
    })

    app.post("/sondages", async (req: Request, res: Response) => {

        const sondageValidation = createSondageValidation.validate(req.body);

        if (sondageValidation.error) {
            res.status(400).send(generateValidationErrorMessage(sondageValidation.error.details))
        }

        const sondageRequest = sondageValidation.value;
        const sondageUseCase = new SondageUseCase(AppDataSource);

        try {
            const result = await sondageUseCase.createSondage(sondageRequest);
            res.status(200).send(result)
        } catch (error) {
            res.status(500).send(error)
        }
    })

    app.get("/sondages", async (req: Request, res: Response) => {

        const sondageValidation = listSondageValidation.validate(req.query);

        if (sondageValidation.error) {
            res.status(400).send(generateValidationErrorMessage(sondageValidation.error.details))
        }

        const listSondageRequest = sondageValidation.value;
        try {

            let limit = 50
            if (listSondageRequest.limit) {
                limit = listSondageRequest.limit
            }
            const page = listSondageRequest.page ?? 1
            try {
                const sondageUseCase = new SondageUseCase(AppDataSource)
                const listplayer = await sondageUseCase.getAllSondages({ ...listSondageRequest, page, limit })
                res.status(200).send(listplayer)
            } catch (error) {
                console.log(error)
                res.status(500).send(error)
                return
            }
        } catch (error) {
            res.status(500).send(error)
        }
    })

    app.get("sondages/:id", async (req: Request, res: Response) => {

        const sondageIdValidation = idSondageValidation.validate(req.params);

        if (sondageIdValidation.error) {
            res.status(400).send(generateValidationErrorMessage(sondageIdValidation.error.details))
        }

        const sondageIdRequest = sondageIdValidation.value.id;
        const sondageUseCase = new SondageUseCase(AppDataSource);

        try {
            const result = await sondageUseCase.getSondageById(sondageIdRequest);
            res.status(200).send(result)
        } catch (error) {
            res.status(500).send(error);
        }
    })
}
