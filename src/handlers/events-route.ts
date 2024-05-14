import express, { Request, Response} from "express";
import { EventIdValidation, EventValidator, listEventValidation } from "./validator/events-validator";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { AppDataSource } from "../database/database";
import { EventuseCase } from "../domain/events-usecase";


export const eventsRoutes = (app: express.Express) => {
     
    app.get("/healthevents", (req: Request, res: Response) => {
        res.send({ "message": "events" })
    })

    // lister les evenement
    app.get("/events", async (req: Request, res: Response) =>{
        try{
            const eventvalidator = listEventValidation.validate(req.query)
            const listeventRequest = eventvalidator.value
            let limit = 50
            if(listeventRequest.limit){
                limit = listeventRequest.limit
            }
            const page = listeventRequest.page ?? 1
            try{
                const eventUseCase = new EventuseCase(AppDataSource)
                const listEvent = await eventUseCase.Listevents({ ...listeventRequest, page, limit })
                res.status(200).send(listEvent)
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
    })

    //création d'un évenement
    app.post("/events",async (req: Request, res: Response) =>{
        try{
            const eventvalidation = EventValidator.validate(req.body)
            if(eventvalidation.error){
                res.status(400).send(generateValidationErrorMessage(eventvalidation.error.details))
            }
            const eventdata = eventvalidation.value
            if(eventdata.Id_Image == null){
                eventdata.Id_Image = 0;
            }
            
            const eventUsecase = new EventuseCase(AppDataSource);
            const result = await  eventUsecase.CreatEvent(eventdata)
            console.log(result)
            return res.status(201).send(result);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

     // Route pour mettre à jour les informations de l'utilisateur
    app.put("/events/:Id", async (req: Request, res: Response) => {
        try {
            const eventidvalidation  = EventIdValidation.validate(req.params)
            
            if(eventidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(eventidvalidation.error.details))
            }
            
            const value =eventidvalidation.value;
            // Récupérer l'ID de l'utilisateur à mettre à jour depuis les paramètres de la requête
            const eventId = value.Id;
            // Récupérer les données à mettre à jour à partir du corps de la requête
            const updatedData = req.body;
            
            // Vérifier si l'ID de l'utilisateur est un nombre valide
            if (isNaN(eventId) || eventId <= 0) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Updated data not provided' });
            }

            // Appeler la fonction upDateUserData pour récupérer l'utilisateur à mettre à jour
            const eventUsecase = new EventuseCase(AppDataSource);
            
            eventUsecase.upDateEventeData(eventId,updatedData)

            // Répondre avec succès et renvoyer les informations mises à jour de l'utilisateur
            return res.status(200).json({"message":"les information sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to update user:", error);
            return res.status(500).json({ error: 'Internal server error. Please retry later.' });
        }
    });

    // sippression d'un utlisateur
    app.delete("/events/:Id",async (req: Request, res : Response) =>{
        try{
            const eventidvalidation  = EventIdValidation.validate(req.params)
            
            if(eventidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(eventidvalidation.error.details))
            }
            
            const eventUsecase = new EventuseCase(AppDataSource);
            const userid = eventidvalidation.value.Id;
            const event  = await eventUsecase.DeleteEvente(userid)
        
            // Vérifier si l'utilisateur a été supprimé avec succès
            if (event.affected === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Répondre avec succès
            return res.status(200).json({ message: 'User deleted successfully' });
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

}
