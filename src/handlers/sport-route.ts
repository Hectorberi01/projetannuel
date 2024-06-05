import express, {Request, Response} from "express";
import {listSportalidation, SportIdValidation, SportValidator} from "./validator/sport-validator";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {SportUseCase} from "../domain/sport-usecase";
import {AppDataSource} from "../database/database";


export const sportRoutes = (app: express.Express) => {

    app.get("/healthsport", (req: Request, res: Response) => {
        res.send({"message": "sport route"})
    })

    // lister les sport disponible
    app.get("/sports", async (req: Request, res: Response) => {
        try {
            const sportvalidator = listSportalidation.validate(req.query)
            const listsportRequest = sportvalidator.value
            let limit = 50
            if (listsportRequest.limit) {
                limit = listsportRequest.limit
            }
            const page = listsportRequest.page ?? 1
            try {
                const sportUseCase = new SportUseCase(AppDataSource)
                const listsport = await sportUseCase.ListeSport({...listsportRequest, page, limit})
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

    app.get("/sports/:Id", async (req: Request, res: Response) => {
        try {
            const sportidvalidation = SportIdValidation.validate(req.params)

            if (sportidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(sportidvalidation.error.details))
            }

            const sportUsecase = new SportUseCase(AppDataSource);
            const sportid = sportidvalidation.value.Id;
            const sport = await sportUsecase.getSportById(sportid)
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


    //création d'un sport
    app.post("/sports", async (req: Request, res: Response) => {
        try {
            const sportvalidation = SportValidator.validate(req.body)
            if (sportvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(sportvalidation.error.details))
            }
            const sportdata = sportvalidation.value

            const sportdataUsecase = new SportUseCase(AppDataSource);
            const result = await sportdataUsecase.CreatSport(sportdata)
            console.log("result", result)
            return res.status(201).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    });

    // Route pour mettre à jour les informations du sport
    app.put("/sports/:Id", async (req: Request, res: Response) => {
        try {
            const sportidvalidation = SportIdValidation.validate(req.params)

            if (sportidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(sportidvalidation.error.details))
            }

            const value = sportidvalidation.value;
            const sportId = value.Id;
            const updatedData = req.body;

            // Vérifier si l'ID du sport est un nombre valide
            if (isNaN(sportId) || sportId <= 0) {
                return res.status(400).json({error: 'Invalid user ID'});
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({error: 'Updated data not provided'});
            }

            // Appeler la fonction SportUseCase pour récupérer le sport à mettre à jour
            const sportUsecase = new SportUseCase(AppDataSource);

            sportUsecase.upDateSportData(sportId, updatedData)

            return res.status(200).json({"message": "les information sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to planning user:", error);
            return res.status(500).json({error: 'Internal server error. Please retry later.'});
        }
    });

    // sippression du sport
    app.delete("/sports/:Id", async (req: Request, res: Response) => {
        try {
            const sportidvalidation = SportIdValidation.validate(req.params)

            if (sportidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(sportidvalidation.error.details))
            }

            const sportUsecase = new SportUseCase(AppDataSource);
            const sportid = sportidvalidation.value.Id;
            const sport = await sportUsecase.DeleteSport(sportid)

            // Vérifier si l'utilisateur a été supprimé avec succès
            if (sport.affected === 0) {
                return res.status(404).json({error: 'planning not found'});
            }
            // Répondre avec succès
            return res.status(200).json({message: 'sport deleted successfully'});
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })
}
