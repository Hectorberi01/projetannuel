import express, {Request, Response} from "express";
import {AppDataSource} from "../database/database";
import {CotisationUseCase} from "../domain/cotisation-usecase";
import {
    idCotisationValidation,
    listCotisationValidation,
    statusCotisationValidation
} from "./validator/cotisation-validator";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {UseruseCase} from "../domain/user-usecase";


export const cotisationRoute = (app: express.Express) => {

    app.get("/cotisations", async (req: Request, res: Response) => {
        try {
            const listCotisationValidate = listCotisationValidation.validate(req.query);
            if (listCotisationValidate.error) {
                res.status(400).send({
                    error: "Invalid query parameters",
                    details: listCotisationValidate.error.details
                });
                return;
            }

            const listRequest = listCotisationValidate.value;
            const limit = listRequest.limit ?? 50;
            const page = listRequest.page ?? 1;

            const useCase = new CotisationUseCase(AppDataSource);
            const listCotisations = await useCase.getAllCotisations({...listRequest, page, limit});
            res.status(200).send(listCotisations);
        } catch (error) {
            res.status(500).send({"error": "Internal error for list event, please retry later"});
        }
    });

    app.put("/cotisations/manage", async (req: Request, res: Response) => {
        try {
            const useCase = new CotisationUseCase(AppDataSource);
            await useCase.verifyUnpaidCotisation();
            res.status(200).send("All good");
        } catch (error: any) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.get("/cotisations/:id", async (req: Request, res: Response) => {
        try {
            const idCotisationValidate = idCotisationValidation.validate(req.params)
            if (idCotisationValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idCotisationValidate.error.details))
            }
            const useCase = new CotisationUseCase(AppDataSource);
            const result = await useCase.getCotisationById(idCotisationValidate.value.id);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.put("/cotisations/:id/:status", async (req: Request, res: Response) => {
        try {
            const statusCotisationValidate = statusCotisationValidation.validate(req.params)

            if (statusCotisationValidate.error) {
                res.status(400).send(generateValidationErrorMessage(statusCotisationValidate.error.details))
            }

            const useCase = new CotisationUseCase(AppDataSource);
            const result = await useCase.updateCotisationStatus(statusCotisationValidate.value.id, statusCotisationValidate.value.status);
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.put("/cotisations/generate-card", async (req: Request, res: Response) => {
        try {
            const useCase = new UseruseCase(AppDataSource);
            const result = await useCase.generateCotisationCard();
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })
}