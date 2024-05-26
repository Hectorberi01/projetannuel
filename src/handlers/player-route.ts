import express, { Request, Response} from "express";
import { PlayerIdValidation, PlayerValidator, listPlayerValidation } from "./validator/player-validator";
import { AppDataSource } from "../database/database";
import { PlayerUseCase } from "../domain/player-usercase";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { SportUseCase } from "../domain/sport-usecase";
import { FormationCenterUserCase } from "../domain/formationcenter-usecase";
import { upload } from "../middlewares/multer-config";


export const playerRoutes = (app: express.Express) => {
     
    app.get("/healthplayer", (req: Request, res: Response) => {
        res.send({ "message": "user player" })
    })

     // lister des jouers
     app.get("/players", async (req: Request, res: Response) =>{
        try{
            const playervalidator = listPlayerValidation.validate(req.query)
            const listplayerequest = playervalidator.value
            let limit = 50
            if(listplayerequest.limit){
                limit = listplayerequest.limit
            }
            const page = listplayerequest.page ?? 1
            try{
                const listplayerUseCase = new PlayerUseCase(AppDataSource)
                const listplayer = await listplayerUseCase.listPlayer({ ...listplayerequest, page, limit })
                res.status(200).send(listplayer)
            }catch(error){
                console.log(error)
                res.status(500).send({ "error": "internal error for list event retry later" })
                return
            }
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    });

    // obtenir le player par son id 
    app.get("/players/:Id", async (req: Request , res : Response) =>{
        try{
            const Playeridvalidation  = PlayerIdValidation.validate(req.params)
            
            if(Playeridvalidation.error){
                res.status(400).send(generateValidationErrorMessage(Playeridvalidation.error.details))
            }
            const playerUseCase = new PlayerUseCase(AppDataSource)
            const playerid = Playeridvalidation.value.Id;
            const player = await playerUseCase.getPlayerById(playerid)
            if (!player) {
                res.status(404).send({ "error": "player prpfil not found" });
                return;
            }
            res.status(200).send(player);

        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    //création d'un profile player
     app.post("/players",async (req: Request, res: Response) =>{
        try{
            const playervalidator = PlayerValidator.validate(req.body)
            if(playervalidator.error){
                console.log("playervalidator",playervalidator)
                res.status(400).send(generateValidationErrorMessage(playervalidator.error.details))
                return
            }
            const playerdata = playervalidator.value
  
        console.log(playerdata)
            const playerUseCase = new PlayerUseCase(AppDataSource)
            const result = await  playerUseCase.createPlayer(playerdata)
            return res.status(201).send(result);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    // Route pour mettre à jour les informations
    app.put("/players/:Id",upload.single('image'), async (req: Request, res: Response) => {
        try {
            const Playeridvalidation  = PlayerIdValidation.validate(req.params)
            if(Playeridvalidation.error){
                res.status(400).send(generateValidationErrorMessage(Playeridvalidation.error.details))
            }
            const playerUseCase = new PlayerUseCase(AppDataSource)
            const playerid = Playeridvalidation.value.Id;

            const updatedData = req.body;
            console.log("req.file",req.file)
            console.log("updatedData",updatedData)
            
            // Ajouter le chemin du fichier téléchargé aux données de mise à jour
            if (req.file) {
                updatedData.imagePath = 'images/' + req.file.filename; // Assurez-vous que ce champ correspond à celui attendu par votre modèle Player
            }
            
            // Vérifier si l'ID un nombre valide
            if (isNaN(playerid) || playerid <= 0) {
                return res.status(400).json({ error: 'Invalid formation ID' });
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Updated data not provided' });
            }
            
            playerUseCase.upDatePlayerData(playerid,updatedData)

            return res.status(200).json({"message":"les information du club sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to update player:", error);
            return res.status(500).json({ error: 'Internal server error. Please retry later.' });
        }
    });

    // sippression d'un centre de formation 
    app.delete("/players/:Id",async (req: Request, res : Response) =>{
        try{
            const Playeridvalidation  = PlayerIdValidation.validate(req.params)
            
            if(Playeridvalidation.error){
                res.status(400).send(generateValidationErrorMessage(Playeridvalidation.error.details))
            }
            const playerUseCase = new PlayerUseCase(AppDataSource)
            const playerid = Playeridvalidation.value.Id;

            const  player  = await playerUseCase.DeletePlayer( playerid)
            console.log("player",player)
            // Vérifier si ça été supprimé avec succès
            if (player.affected === 0) {
                return res.status(404).json({ error: 'player not found' });
            }
            // Répondre avec succès
            return res.status(200).json({ message: 'player deleted successfully' });
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })
}
