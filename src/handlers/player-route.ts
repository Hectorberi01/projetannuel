import express, {Request, Response} from "express";
import {
    createPlayerValidation,
    listPlayerValidation,
    playerIdValidation,
    updatePlayerValidation
} from "./validator/player-validator";
import {AppDataSource} from "../database/database";
import {PlayerUseCase} from "../domain/player-usercase";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {upload} from "../middlewares/multer-config";


export const playerRoutes = (app: express.Express) => {

    // lister des jouers
    app.get("/players", async (req: Request, res: Response) => {
        try {
            const playervalidator = listPlayerValidation.validate(req.query)
            const listplayerequest = playervalidator.value
            let limit = 50
            if (listplayerequest.limit) {
                limit = listplayerequest.limit
            }
            const page = listplayerequest.page ?? 1
            try {
                const listplayerUseCase = new PlayerUseCase(AppDataSource)
                const listplayer = await listplayerUseCase.getAllPlayers({...listplayerequest, page, limit})
                res.status(200).send(listplayer)
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

    // obtenir le player par son id 
    app.get("/players/:id", async (req: Request, res: Response) => {
        try {
            const playerIdValidate = playerIdValidation.validate(req.params)

            if (playerIdValidate.error) {
                res.status(400).send(generateValidationErrorMessage(playerIdValidate.error.details))
            }
            const playerUseCase = new PlayerUseCase(AppDataSource)
            const playerid = playerIdValidate.value.id;
            const player = await playerUseCase.getPlayerById(playerid)
            if (!player) {
                res.status(404).send({"error": "player not found"});
                return;
            }
            res.status(200).send(player);

        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    //création d'un profile player
    app.post("/players", upload.single('image'), async (req: Request, res: Response) => {
        try {
            const playervalidator = createPlayerValidation.validate(req.body)
            if (playervalidator.error) {
                res.status(400).send(generateValidationErrorMessage(playervalidator.error.details))
                return
            }
            const playerdata = playervalidator.value

            console.log(playerdata)
            const playerUseCase = new PlayerUseCase(AppDataSource)
            const result = await playerUseCase.createPlayer(playerdata, req.file)
            return res.status(201).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    // Route pour mettre à jour les informations
    app.put("/players/:id", async (req: Request, res: Response) => {
        try {
            const playerIdValidate = playerIdValidation.validate(req.params)

            if (playerIdValidate.error) {
                res.status(400).send(generateValidationErrorMessage(playerIdValidate.error.details))
            }

            const playerUpdateValidate = updatePlayerValidation.validate(req.body);

            if (playerUpdateValidate.error) {
                res.status(400).send(generateValidationErrorMessage(playerUpdateValidate.error.details))
            }
            const playerUseCase = new PlayerUseCase(AppDataSource)
            const updateData = playerUpdateValidate.value;

            const result = await playerUseCase.updatePlayerData(playerIdValidate.value.id, updateData)

            return res.status(200).send(result);
        } catch (error) {
            console.error("Failed to update player:", error);
            return res.status(500).json({error: 'Internal server error. Please retry later.'});
        }
    });

    app.delete("/players/:id", async (req: Request, res: Response) => {
        try {
            const idPlayerValidation = playerIdValidation.validate(req.params)

            if (idPlayerValidation.error) {
                res.status(400).send(generateValidationErrorMessage(idPlayerValidation.error.details))
            }
            const playerUseCase = new PlayerUseCase(AppDataSource)
            const result = await playerUseCase.deletePlayer(idPlayerValidation.value.id)
            return res.status(200).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })
}
