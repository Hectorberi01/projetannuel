import express, { Request, Response} from "express";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { AppDataSource } from "../database/database";
import { PlanninguseCase } from "../domain/planning-usecase";
import {PlanningIdValidation, PlanningValidator,listPlanningValidation} from "../handlers/validator/planning-validator"


export const planningRoutes = (app: express.Express) => {
    // lister les planning
    app.get("/planning", async (req: Request, res: Response) =>{
        try{
            const planningvalidator = listPlanningValidation.validate(req.query)
            const listplanningRequest = planningvalidator.value
            let limit = 50
            if(listplanningRequest.limit){
                limit = listplanningRequest.limit
            }
            const page = listplanningRequest.page ?? 1
            try{
                const planningUseCase = new PlanninguseCase(AppDataSource)
                const listplanning = await planningUseCase.ListePlanning({ ...listplanningRequest, page, limit })
                res.status(200).send(listplanning)
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

    // obtenir le planning par l'id du planning
    app.get("/planning/:Id", async (req: Request , res : Response) =>{
        try{
            const planningidvalidation  = PlanningIdValidation.validate(req.params)
            
            if(planningidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(planningidvalidation.error.details))
            }
        
            const planningdataUsecase = new PlanninguseCase(AppDataSource);
            const planningid = planningidvalidation.value.Id;
            const planning  = await planningdataUsecase.getPlanningById(planningid)
            if (!planning) {
                res.status(404).send({ "error": "User not found" });
                return;
            }
            res.status(200).send(planning);

        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    //création d'un planning
    app.post("/planning",async (req: Request, res: Response) =>{
        try{
            const planningvalidation = PlanningValidator.validate(req.body)
            if(planningvalidation.error){
                res.status(400).send(generateValidationErrorMessage(planningvalidation.error.details))
            }
            const planningdata = planningvalidation.value

            const planningdataUsecase = new PlanninguseCase(AppDataSource);
            const result = await  planningdataUsecase.CreatPlanning(planningdata)
            console.log("result",result)
            return res.status(201).send(result);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    });

    // Route pour mettre à jour les informations de l'utilisateur
    app.put("/planning/:Id", async (req: Request, res: Response) => {
        try {
            const planningidvalidation  = PlanningIdValidation.validate(req.params)
            
            if(planningidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(planningidvalidation.error.details))
            }
            
            const value =planningidvalidation.value;
            const planningId = value.Id;
            const updatedData = req.body;
            
            // Vérifier si l'ID de l'utilisateur est un nombre valide
            if (isNaN(planningId) || planningId <= 0) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Updated data not provided' });
            }

            // Appeler la fonction upDateUserData pour récupérer l'utilisateur à mettre à jour
            const planningUsecase = new PlanninguseCase(AppDataSource);
            
            planningUsecase.upDatePlanningData(planningId,updatedData)

            return res.status(200).json({"message":"les information sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to planning user:", error);
            return res.status(500).json({ error: 'Internal server error. Please retry later.' });
        }
    });

    // sippression d'un utlisateur
    app.delete("/planning/:Id",async (req: Request, res : Response) =>{
        try{
            const planningidvalidation  = PlanningIdValidation.validate(req.params)
            
            if(planningidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(planningidvalidation.error.details))
            }
            
            const planningUsecase = new PlanninguseCase(AppDataSource);
            const planningid = planningidvalidation.value.Id;
            const planning  = await planningUsecase.DeletePlanning(planningid)
        
            // Vérifier si l'utilisateur a été supprimé avec succès
            if (planning.affected === 0) {
                return res.status(404).json({ error: 'planning not found' });
            }
            // Répondre avec succès
            return res.status(200).json({ message: 'planning deleted successfully' });
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

}