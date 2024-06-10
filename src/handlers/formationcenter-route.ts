import express, {Request, Response} from "express";
import {AppDataSource} from "../database/database";
import {
    FormationCenterIdValidation,
    FormationCenterValidator,
    listFormationCenterValidation
} from "./validator/formation-validator";
import {FormationCenterUseCase} from "../domain/formationcenter-usecase";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";

export const formationcenterRoutes = (app: express.Express) => {

    app.get("/formations-centers", async (req: Request, res: Response) => {
        try {
            const formationvalidator = listFormationCenterValidation.validate(req.query)
            const listformationRequest = formationvalidator.value
            let limit = 50
            if (listformationRequest.limit) {
                limit = listformationRequest.limit
            }
            const page = listformationRequest.page ?? 1
            try {
                const listformationUseCase = new FormationCenterUseCase(AppDataSource)
                const listclub = await listformationUseCase.getAllFormationsCenters({
                    ...listformationRequest,
                    page,
                    limit
                })
                res.status(200).send(listclub)
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

    app.get("/formations-centers/:id", async (req: Request, res: Response) => {
        try {
            const formationidvalidation = FormationCenterIdValidation.validate(req.params)

            if (formationidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(formationidvalidation.error.details))
            }

            const formationUseCase = new FormationCenterUseCase(AppDataSource)
            const formationid = formationidvalidation.value.Id;
            const formation = await formationUseCase.getFormationCenterById(formationid)
            if (!formation) {
                res.status(404).send({"error": "formation center account not found"});
                return;
            }
            res.status(200).send(formation);

        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    app.post("/formations-centers", async (req: Request, res: Response) => {
        try {
            const formationvalidator = FormationCenterValidator.validate(req.body)
            if (formationvalidator.error) {
                res.status(400).send(generateValidationErrorMessage(formationvalidator.error.details));
            }

            const formationvalidatordata = formationvalidator.value;

            const formationUseCase = new FormationCenterUseCase(AppDataSource)
            const result = await formationUseCase.createFormationCenter(formationvalidatordata)
            return res.status(201).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    // Route pour mettre à jour les informations du centre de formation 
    app.put("/formations-centers/:id", async (req: Request, res: Response) => {
        try {
            const formationidvalidation = FormationCenterIdValidation.validate(req.params)

            if (formationidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(formationidvalidation.error.details))
            }

            const formationId = formationidvalidation.value.id;
            const updatedData = req.body;

            // Vérifier si l'ID du centre de formation est un nombre valide
            if (isNaN(formationId) || formationId <= 0) {
                return res.status(400).json({error: 'Invalid formation ID'});
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({error: 'Updated data not provided'});
            }

            const formationUseCase = new FormationCenterUseCase(AppDataSource)

            formationUseCase.updateFormationCenter(formationId, updatedData)

            return res.status(200).json({"message": "les information du club sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to planning user:", error);
            return res.status(500).json({error: 'Internal server error. Please retry later.'});
        }
    });

    // sippression d'un centre de formation 
    app.delete("/formations-centers/:id", async (req: Request, res: Response) => {
        try {
            const formationidvalidation = FormationCenterIdValidation.validate(req.params)

            if (formationidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(formationidvalidation.error.details))
            }

            const formationUseCase = new FormationCenterUseCase(AppDataSource)
            const formationId = formationidvalidation.value.id;
            const formation = await formationUseCase.deleteFormationCenter(formationId)

            // Vérifier si le centre de formatrion été supprimé avec succès
            if (formation.affected === 0) {
                return res.status(404).json({error: 'formation not found'});
            }
            // Répondre avec succès
            return res.status(200).json({message: 'formation deleted successfully'});
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    app.get("/formations-centers/:id/players", async (req: Request, res: Response) => {
        try {
            const idFormationCenterValidate = FormationCenterIdValidation.validate(req.params)

            if (idFormationCenterValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idFormationCenterValidate.error.details))
            }

            const formationCenterUseCase = new FormationCenterUseCase(AppDataSource);
            const result = await formationCenterUseCase.getAssociatedPlayers(idFormationCenterValidate.value.id);
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error)
        }
    })
}
