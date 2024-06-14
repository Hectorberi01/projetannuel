import express, {Request, Response} from "express";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {AppDataSource} from "../database/database";
import {
    createSondageValidation,
    idSondageValidation,
    listSondageValidation,
    userAlreadyVoted,
    voteSondageValidation
} from "./validator/sondage-validator";
import {SondageUseCase} from "../domain/sondage-usecase";


export const sondagesRoutes = (app: express.Express) => {

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
                const listplayer = await sondageUseCase.getAllSondages({...listSondageRequest, page, limit})
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

    app.get("/sondages/:id", async (req: Request, res: Response) => {

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

    app.put("/sondages/:id/vote", async (req: Request, res: Response) => {

        const voteValidation = voteSondageValidation.validate(req.body);
        if (voteValidation.error) {
            return res.status(400).send(generateValidationErrorMessage(voteValidation.error.details));
        }

        const voteData = voteValidation.value;

        const sondageUseCase = new SondageUseCase(AppDataSource);

        try {
            const result = await sondageUseCase.voteForSondage(voteData.idSondage, voteData.idQuestion, voteData.idUser);
            return res.status(200).send(result);
        } catch (error: any) {
            return res.status(500).json({message: error.message});
        }
    })

        app.get("/sondages/:id/answers", async (req: Request, res: Response) => {

            const sondageIdValidation = idSondageValidation.validate(req.params);

            if (sondageIdValidation.error) {
                res.status(400).send(generateValidationErrorMessage(sondageIdValidation.error.details))
            }

            const sondageIdRequest = sondageIdValidation.value.id;
            const sondageUseCase = new SondageUseCase(AppDataSource);

            try {
                const result = await sondageUseCase.getAnswersOfSondage(sondageIdRequest);
                res.status(200).send(result)
            } catch (error) {
                res.status(500).send(error);
            }
        })

    app.get("/sondages/:idSondage/user/:idUser/voted", async (req: Request, res: Response) => {

        const sondageUserAlreadyVotedValidation = userAlreadyVoted.validate(req.params);

        if (sondageUserAlreadyVotedValidation.error) {
            res.status(400).send(generateValidationErrorMessage(sondageUserAlreadyVotedValidation.error.details))
        }

        const idSondage = sondageUserAlreadyVotedValidation.value.idSondage;
        const idUser = sondageUserAlreadyVotedValidation.value.idUser;
        const sondageUseCase = new SondageUseCase(AppDataSource);

        try {
            const result = await sondageUseCase.verifyIfUserAlreadyVoted(idSondage, idUser);
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }

    })
}
