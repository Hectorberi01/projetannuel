import express, { Request, Response} from "express";
import { SportIdValidation, listSportalidation } from "./validator/sport-validator";
import { RoleUseCase } from "../domain/roles-usecase";
import { AppDataSource } from "../database/database";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { RoleValidator } from "./validator/roles-validator";


export const roleRoutes = (app: express.Express) => {
     
    app.get("/healthrole", (req: Request, res: Response) => {
        res.send({ "message": "user route" })
    })

    // lister les sport disponible
    app.get("/roles", async (req: Request, res: Response) =>{
        try{
            const rolevalidator = listSportalidation.validate(req.query)
            const listRequest = rolevalidator.value
            let limit = 50
            if(listRequest.limit){
                limit = listRequest.limit
            }
            const page = listRequest.page ?? 1
            try{
                const roletUseCase = new RoleUseCase(AppDataSource)
                const listrole = await roletUseCase.ListeRole({ ...listRequest, page, limit })
                res.status(200).send(listrole)
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

     // obtenir le role par l'id du planning
     app.get("/roles/:Id", async (req: Request , res : Response) =>{
        try{
            const roleidvalidation  = SportIdValidation.validate(req.params)
            
            if(roleidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(roleidvalidation.error.details))
            }

            const roletUseCase = new RoleUseCase(AppDataSource)
            const roleid = roleidvalidation.value.Id;
            const role  = await roletUseCase.getRoleById(roleid)
            if (!role) {
                res.status(404).send({ "error": "role not found" });
                return;
            }
            res.status(200).send(role);

        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })


    //création d'un role
    app.post("/roles",async (req: Request, res: Response) =>{
        try{
            const rolevalidation = RoleValidator.validate(req.body)
            if(rolevalidation.error){
                res.status(400).send(generateValidationErrorMessage(rolevalidation.error.details))
            }
            const roledata = rolevalidation.value

            const roletUseCase = new RoleUseCase(AppDataSource)
            const result = await  roletUseCase.CreatRole(roledata)
            console.log("result",result)
            return res.status(201).send(result);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    });

    // Route pour mettre à jour les informations du sport
    app.put("/roles/:Id", async (req: Request, res: Response) => {
        try {
            const roleidvalidation  = SportIdValidation.validate(req.params)
            
            if(roleidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(roleidvalidation.error.details))
            }
            
            const value =roleidvalidation.value;
            const roleId = value.Id;
            const updatedData = req.body;
            
            // Vérifier si l'ID du sport est un nombre valide
            if (isNaN(roleId) || roleId <= 0) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Updated data not provided' });
            }

            // Appeler la fonction SportUseCase pour récupérer le sport à mettre à jour
            const roletUseCase = new RoleUseCase(AppDataSource)
            
            roletUseCase.upDateRoleData(roleId,updatedData)

            return res.status(200).json({"message":"les information sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to planning user:", error);
            return res.status(500).json({ error: 'Internal server error. Please retry later.' });
        }
    });

    // sippression du sport
    app.delete("/roles/:Id",async (req: Request, res : Response) =>{
        try{
            const roleidvalidation  = SportIdValidation.validate(req.params)
            
            if(roleidvalidation.error){
                res.status(400).send(generateValidationErrorMessage(roleidvalidation.error.details))
            }
            
            const roletUseCase = new RoleUseCase(AppDataSource)
            const id = roleidvalidation.value.Id;
            const role  = await roletUseCase.DeleteRole(id)
        
            // Vérifier si l'utilisateur a été supprimé avec succès
            if (role.affected === 0) {
                return res.status(404).json({ error: 'role not found' });
            }
            // Répondre avec succès
            return res.status(200).json({ message: 'sport role successfully' });
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })
}
