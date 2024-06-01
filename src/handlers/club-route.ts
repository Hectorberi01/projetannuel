import express, { Request, Response} from "express";
import { ClubIdValidation, ClubValidator, listClubValidation } from "./validator/club-validator";
import { ClubUseCase } from "../domain/club-usecase";
import { AppDataSource } from "../database/database";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { SportUseCase } from "../domain/sport-usecase";
import { upload } from "../middlewares/multer-config";


export const clubRoutes = (app: express.Express) => {
     
    app.get("/healthclub", (req: Request, res: Response) => {
        res.send({ "message": "clud" })
    })

     app.get("/clubs", async (req: Request, res: Response) =>{
        try{
            const clubvalidator = listClubValidation.validate(req.query)
            const listclubRequest = clubvalidator.value
            let limit = 50
            if(listclubRequest.limit){
                limit = listclubRequest.limit
            }
            const page = listclubRequest.page ?? 1
            try{
                const clubUseCase = new ClubUseCase(AppDataSource)
                const listclub = await clubUseCase.ListeClub({ ...listclubRequest, page, limit })
                res.status(200).send(listclub)
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

    // obtenir le club par son id 
    app.get("/clubs/:Id", async (req: Request , res : Response) =>{
        try{
            const clubidvalidation  = ClubIdValidation.validate(req.params)
            
            if(clubidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(clubidvalidation.error.details))
            }
        
            const clubdataUsecase = new ClubUseCase(AppDataSource);
            const clubid = clubidvalidation.value.Id;
            const club  = await clubdataUsecase.getClubById(clubid)
            if (!club) {
                res.status(404).send({ "error": "club account not found" });
                return;
            }
            res.status(200).send(club);

        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    //création d'un compte club
    app.post("/clubs",upload.single('image'),async (req: Request, res: Response) =>{
        const clubUsecase = new ClubUseCase(AppDataSource);
        try{
            // Convertir la chaîne JSON en tableau
            if (typeof req.body.Sport === 'string') {
                req.body.Sport = JSON.parse(req.body.Sport);
            }
            const clubvalidation = ClubValidator.validate(req.body)

            console.log("clubvalidation",clubvalidation)
            if(clubvalidation.error){
                res.status(400).send(generateValidationErrorMessage(clubvalidation.error.details))
                return
            }
            const clubdata = clubvalidation.value

            const Data = req.body;
            console.log("req.file",req.file)
            console.log("updatedData",Data)
            // Ajouter le chemin du fichier téléchargé aux données de mise à jour
            if (req.file) {
                Data.imagePath = 'images/' + req.file.filename; // Assurez-vous que ce champ correspond à celui attendu par votre modèle Player
            }

            
            const result = await  clubUsecase.CreatClub(clubdata,Data)
            return res.status(201).send(result);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })


    // Route pour mettre à jour les informations de l'utilisateur
    app.put("/clubs/:Id",upload.single('image'), async (req: Request, res: Response) => {
        try {
            const clubidvalidation  = ClubIdValidation.validate(req.params)
            
            if(clubidvalidation.error){
                console.log(clubidvalidation),
                res.status(400).send(generateValidationErrorMessage(clubidvalidation.error.details))
                return
            }

            const updatedData = req.body;
            console.log("req.file",req.file)
            console.log("updatedData",updatedData)
            
            const value = clubidvalidation.value;
            const clubId = value.Id;

            // Ajouter le chemin du fichier téléchargé aux données de mise à jour
            if (req.file) {
                updatedData.imagePath = 'images/' + req.file.filename; // Assurez-vous que ce champ correspond à celui attendu par votre modèle Player
            }
            // Vérifier si l'ID de l'utilisateur est un nombre valide
            if (isNaN(clubId) || clubId <= 0) {
                return res.status(400).json({ error: 'Invalid club ID' });
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Updated data not provided' });
            }

            // Appeler la fonction ClubUseCase pour récupérer le club à mettre à jour
            const clubdataUsecase = new ClubUseCase(AppDataSource);
            
            clubdataUsecase.upDateClubData(clubId,updatedData)

            return res.status(200).json({"message":"les information du club sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to planning user:", error);
            return res.status(500).json({ error: 'Internal server error. Please retry later.' });
        }
    });

    // sippression d'un club
    app.delete("/club/:Id",async (req: Request, res : Response) =>{
        try{
            const clubidvalidation  = ClubIdValidation.validate(req.params)
            
            if(clubidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(clubidvalidation.error.details))
            }
            
            const clubdataUsecase = new ClubUseCase(AppDataSource);
            const clubid = clubidvalidation.value.Id;
            const club  = await clubdataUsecase.DeleteClub(clubid)
        
            // Vérifier si le club a été supprimé avec succès
            if (club.affected === 0) {
                return res.status(404).json({ error: 'club not found' });
            }
            // Répondre avec succès
            return res.status(200).json({ message: 'club deleted successfully' });
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })
}
