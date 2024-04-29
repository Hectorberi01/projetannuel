import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";
import { VoteUseCase } from "../domain/vote-usecase";
import { AsignVoteUserValidation, VoteIdValidation, VoteValidator, listVoteValidation } from "./validator/vote-validator";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";

export const voteRoutes = (app: express.Express) => {
     
    app.get("/healthplayer", (req: Request, res: Response) => {
        res.send({ "message": "vote" })
    })

     // lister les votes
     app.get("/votes", async (req: Request, res: Response) =>{
        try{
            const votevalidator = listVoteValidation.validate(req.query)
            const listvoterequest = votevalidator.value
            let limit = 50
            if(listvoterequest.limit){
                limit = listvoterequest.limit
            }
            const page = listvoterequest.page ?? 1
            try{
                const voteUseCase = new VoteUseCase(AppDataSource)
                const listvote = await voteUseCase.listVote({ ...listvoterequest, page, limit })
                res.status(200).send(listvote)
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
    app.get("/votes/:Id", async (req: Request , res : Response) =>{
        try{
            const Voteidvalidation  = VoteIdValidation.validate(req.params)
            
            if(Voteidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(Voteidvalidation.error.details))
            }
            const voteUseCase = new VoteUseCase(AppDataSource)
            const voteid = Voteidvalidation.value.Id;
            const vote = await voteUseCase.getVoteById(voteid)
            if (!vote) {
                res.status(404).send({ "error": "vote not found" });
                return;
            }
            res.status(200).send(vote);

        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    //création d'un profile player
     app.post("/votes",async (req: Request, res: Response) =>{
        try{
            const votevalidator = VoteValidator.validate(req.body)
            if(votevalidator.error){
                res.status(400).send(generateValidationErrorMessage(votevalidator.error.details))
            }
            const votedata = votevalidator.value
    
            console.log(votedata)
            const voteUseCase = new VoteUseCase(AppDataSource)
            const result = await  voteUseCase.createVote(votedata)
            return res.status(201).send(result);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

   
    app.put("/votes/users/:Id", async (req: Request, res: Response) => {
        try {
            const Voteidvalidation  = AsignVoteUserValidation.validate(req.params)
            const voteUseCase = new VoteUseCase(AppDataSource);
            if(Voteidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(Voteidvalidation.error.details))
            }
            // Extracting values after validation
            const voteId = parseInt(Voteidvalidation.value.Id);
            const updatedData = req.body;
            const userId = parseInt(updatedData.Id_user);

            // Validate that IDs are numbers and greater than zero
            if (isNaN(voteId) || voteId <= 0) {
                return res.status(400).json({ error: 'Invalid vote or user ID' });
            }
            // Validate the presence of updated data
           
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Updated data not provided' });
            }
            voteUseCase.AssignVoteUser(voteId, userId);
        } catch (error) {
            console.error("Failed to update vote:", error);
            return res.status(500).json({ error: 'Internal server error. Please retry later.' });
        }
        
    });

     // Route pour mettre à jour les informations
     app.put("/votes/:Id", async (req: Request, res: Response) => {
        try {
            const Voteidvalidation  = VoteIdValidation.validate(req.params)
            
            if(Voteidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(Voteidvalidation.error.details))
            }
            const voteUseCase = new VoteUseCase(AppDataSource)
            const voteid = Voteidvalidation.value.Id;
            const updatedData = req.body;
            
            // Vérifier si l'ID un nombre valide
            if (isNaN(voteid) || voteid <= 0) {
                return res.status(400).json({ error: 'Invalid formation ID' });
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Updated data not provided' });
            }
            
            voteUseCase.upDateVoteData(voteid,updatedData)

            return res.status(200).json({"message":"les information du club sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to update player:", error);
            return res.status(500).json({ error: 'Internal server error. Please retry later.' });
        }
    });

    // sippression d'un centre de formation 
    app.delete("/votes/:Id",async (req: Request, res : Response) =>{
        try{
            const Voteidvalidation  = VoteIdValidation.validate(req.params)
            
            if(Voteidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(Voteidvalidation.error.details))
            }
            const voteUseCase = new VoteUseCase(AppDataSource)
            const voteid = Voteidvalidation.value.Id;

            const  vote  = await voteUseCase.DeleteVote( voteid)
        
            // Vérifier si ça été supprimé avec succès
            if (vote.affected === 0) {
                return res.status(404).json({ error: 'vote not found' });
            }
            // Répondre avec succès
            return res.status(200).json({ message: 'vote deleted successfully' });
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })
}
