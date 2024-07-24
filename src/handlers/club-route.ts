import express, {Request, Response} from "express";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {AppDataSource} from "../database/database";
import {
    createClubValidation,
    idClubValidation,
    listClubValidation,
    updateClubValidation
} from "./validator/club-validator";
import {ClubUseCase} from "../domain/club-usecase";
import {upload} from "../middlewares/multer-config";
import {CotisationUseCase} from "../domain/cotisation-usecase";
import {EntityType} from "../Enumerators/EntityType";


export const clubRoutes = (app: express.Express) => {

    app.get("/clubs", async (req: Request, res: Response) => {
        try {
            const listClubValidate = listClubValidation.validate(req.body);

            if (listClubValidate.error) {
                res.status(400).send(generateValidationErrorMessage(listClubValidate.error.details))
            }

            let limit = 50
            if (listClubValidate.value.limit) {
                limit = listClubValidate.value.limit;
            }
            const page = listClubValidate.value.page ?? 1

            const clubUseCase = new ClubUseCase(AppDataSource)
            const listClubs = await clubUseCase.getAllClubs({...listClubValidate, page, limit})
            res.status(200).send(listClubs)
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    });

    app.get("/clubs/recents", async (req: Request, res: Response) => {
        try {
            const useCase = new ClubUseCase(AppDataSource);
            const result = await useCase.getRecentClubs();
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send(error.message)
        }
    })

    app.get("/clubs/:id", async (req: Request, res: Response) => {
        try {
            const idSportValidate = idClubValidation.validate(req.params)

            if (idSportValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idSportValidate.error.details))
            }

            const clubUseCase = new ClubUseCase(AppDataSource);
            const result = await clubUseCase.getClubById(idSportValidate.value.id);
            res.status(200).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    app.post("/clubs", upload.single("image"), async (req: Request, res: Response) => {
        try {
            const createClubValidate = createClubValidation.validate(req.body)
            if (createClubValidate.error) {
                res.status(400).send(generateValidationErrorMessage(createClubValidate.error.details))
            }
            const clubUseCase = new ClubUseCase(AppDataSource);
            const result = await clubUseCase.createClub(createClubValidate.value, req.file)
            return res.status(201).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    });

    app.put("/clubs/:id", upload.single('image'), async (req: Request, res: Response) => {
        try {
            const idSportValidate = idClubValidation.validate(req.params)

            if (idSportValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idSportValidate.error.details))
            }

            const updateSportValidate = updateClubValidation.validate(req.body);

            if (updateSportValidate.error) {
                res.status(400).send(generateValidationErrorMessage(updateSportValidate.error.details))
            }

            const clubUseCase = new ClubUseCase(AppDataSource);
            const result = await clubUseCase.updateClub(idSportValidate.value.id, updateSportValidate.value)
            return res.status(200).send(result);
        } catch (error) {
            console.error("Failed to planning user:", error);
            return res.status(500).json({error: 'Internal server error. Please retry later.'});
        }
    });

    app.delete("/clubs/:id", async (req: Request, res: Response) => {
        try {
            const idClubValidate = idClubValidation.validate(req.params)

            if (idClubValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idClubValidate.error.details))
            }

            const clubUseCase = new ClubUseCase(AppDataSource);
            const result = await clubUseCase.deleteClub(idClubValidate.value.id)
            return res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.get("/clubs/:id/users", async (req: Request, res: Response) => {
        try {
            const idClubValidate = idClubValidation.validate(req.params)

            if (idClubValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idClubValidate.error.details))
            }

            const clubUseCase = new ClubUseCase(AppDataSource);
            const result = await clubUseCase.getAllClubUsers(idClubValidate.value.id);
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.get("/clubs/:id/cotisations", async (req: Request, res: Response) => {
        try {
            const idClubValidate = idClubValidation.validate(req.params)
            if (idClubValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idClubValidate.error.details))
            }
            const cotisationUseCase = new CotisationUseCase(AppDataSource);
            const result = await cotisationUseCase.getCotisationFromEntity(EntityType.CLUB, idClubValidate.value.id);
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.put("/clubs/:id/recreate-cotisation", async (req: Request, res: Response) => {
        try {
            const idClubValidate = idClubValidation.validate(req.params)
            if (idClubValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idClubValidate.error.details))
            }
            const cotisationUseCase = new CotisationUseCase(AppDataSource);
            const result = await cotisationUseCase.createCotisation(EntityType.CLUB, idClubValidate.value.id);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })
}
