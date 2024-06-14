import express, {Request, Response} from "express";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {SportUseCase} from "../domain/sport-usecase";
import {AppDataSource} from "../database/database";
import {createSportValidation, idSportValidation} from "./validator/sport-validator";
import {listRoleValidation} from "./validator/roles-validator";

export const sportRoutes = (app: express.Express) => {

    // lister les sport disponible
    app.get("/sports", async (req: Request, res: Response) => {
        try {
            const sportvalidator = listRoleValidation.validate(req.query)
            const listsportRequest = sportvalidator.value
            let limit = 50
            if (listsportRequest.limit) {
                limit = listsportRequest.limit
            }
            const page = listsportRequest.page ?? 1
            try {
                const sportUseCase = new SportUseCase(AppDataSource)
                const listsport = await sportUseCase.getAllSports({...listsportRequest, page, limit})
                res.status(200).send(listsport)
            } catch (error) {
                console.log(error)
                res.status(500).send({"error": "internal error for list event retry later"})
                return
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    });

    app.get("/sports/:id", async (req: Request, res: Response) => {
        try {
            const idSportValidate = idSportValidation.validate(req.params)

            if (idSportValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idSportValidate.error.details))
            }

            const sportUsecase = new SportUseCase(AppDataSource);
            const sport = await sportUsecase.getSportById(idSportValidate.value.id)
            if (!sport) {
                res.status(404).send({"error": "sport not found"});
                return;
            }
            res.status(200).send(sport);

        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    app.post("/sports", async (req: Request, res: Response) => {
        try {
            const createSportValidate = createSportValidation.validate(req.body);
            if (createSportValidate.error) {
                return res.status(400).send({message: generateValidationErrorMessage(createSportValidate.error.details)});
            }
            const sportData = createSportValidate.value;

            const sportUseCase = new SportUseCase(AppDataSource);
            const result = await sportUseCase.createSport(sportData);
            return res.status(201).send(result);
        } catch (error) {
            console.log(error);
            return res.status(500).send({message: "Erreur interne, veuillez réessayer plus tard."});
        }
    });

    app.put("/sports/:id", async (req: Request, res: Response) => {
        try {
            const idSportValidate = idSportValidation.validate(req.params);
            if (idSportValidate.error) {
                return res.status(400).send({message: generateValidationErrorMessage(idSportValidate.error.details)});
            }

            const value = idSportValidate.value;
            const sportId = value.id;
            const updatedData = req.body;

            if (isNaN(sportId) || sportId <= 0) {
                return res.status(400).json({message: 'ID du sport invalide'});
            }

            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({message: 'Données mises à jour non fournies'});
            }

            const sportUseCase = new SportUseCase(AppDataSource);
            await sportUseCase.updateSport(sportId, updatedData);

            return res.status(200).json({message: "Les informations ont été enregistrées avec succès."});
        } catch (error) {
            console.error("Failed to update sport:", error);
            return res.status(500).json({message: 'Erreur interne. Veuillez réessayer plus tard.'});
        }
    });

    app.delete("/sports/:id", async (req: Request, res: Response) => {
        try {
            const idSportValidate = idSportValidation.validate(req.params);
            if (idSportValidate.error) {
                return res.status(400).send({message: generateValidationErrorMessage(idSportValidate.error.details)});
            }

            const sportUseCase = new SportUseCase(AppDataSource);
            const sportId = idSportValidate.value.id;
            await sportUseCase.deleteSport(sportId);

            return res.status(200).json({message: 'Sport supprimé avec succès'});
        } catch (error) {
            console.error("Failed to delete sport:", error);
            return res.status(500).send({message: "Erreur interne, veuillez réessayer plus tard."});
        }
    });

    app.get("/sports/:id/formations-centers", async (req: Request, res: Response) => {

        try {
            const sportIdValidate = idSportValidation.validate(req.params)

            if (sportIdValidate.error) {
                res.status(400).send(generateValidationErrorMessage(sportIdValidate.error.details))
            }

            const sportUseCase = new SportUseCase(AppDataSource);
            const result = await sportUseCase.getAssociatedFormationsCenters(sportIdValidate.value.id);
            return res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.get("/sports/:id/players", async (req: Request, res: Response) => {

        try {
            const sportIdValidate = idSportValidation.validate(req.params)

            if (sportIdValidate.error) {
                res.status(400).send(generateValidationErrorMessage(sportIdValidate.error.details))
            }

            const sportUseCase = new SportUseCase(AppDataSource);
            const result = await sportUseCase.getAssociatedPlayers(sportIdValidate.value.id);
            return res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.get("/sports/:id/clubs", async (req: Request, res: Response) => {

        try {
            const sportIdValidate = idSportValidation.validate(req.params)

            if (sportIdValidate.error) {
                res.status(400).send(generateValidationErrorMessage(sportIdValidate.error.details))
            }

            const sportUseCase = new SportUseCase(AppDataSource);
            const result = await sportUseCase.getAssociatedClubs(sportIdValidate.value.id);
            return res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })
}
