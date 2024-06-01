import express, { Request, Response} from "express";
import {UserValidator, UserLoginlValidation, UserIdValidation, listUserValidation} from "../handlers/validator/useraccount-validator"
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { AppDataSource } from "../database/database";
import { UseruseCase } from "../domain/user-usecase";
import bcrypt, { compare } from 'bcrypt';
import jwt, { sign } from 'jsonwebtoken';
import { Token } from "../database/entities/token";
import { upload } from "../middlewares/multer-config";
import { authMiddleware } from "../middlewares/auth-middleware";

export const userRoutes = (app: express.Express) => {

    //Obternir la liste de tout les utlisateurs
    app.get("/users/account", async(req :Request, res :Response) =>{
        try{
            const uservalidator = listUserValidation.validate(req.query)
            if(uservalidator.error){
                console.log("uservalidator",uservalidator)
                res.status(400).send(generateValidationErrorMessage(uservalidator.error.details))
                return
            }
            const listuserRequest = uservalidator.value
            let limit = 50
            if(listuserRequest.limit){
                limit = listuserRequest.limit
            }
            const page = listuserRequest.page ?? 1
            try{
                const userUseCase = new UseruseCase(AppDataSource)
                const listUser = await userUseCase.listUser({ ...listuserRequest, page, limit })
                res.status(200).send(listUser)
            }catch(error){
                console.log(error)
                res.status(500).send({ "error": "internal error for list user retry later" })
                return
            }
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    // pour la création d'un compte utilisateur
    app.post("/users/auth/signup",upload.single('image'),async(req: Request, res : Response) =>{
        const userUsecase = new UseruseCase(AppDataSource);
        console.log("req.file",req.file)
        try{
            console.log("userdata",req.body)
  
            if (typeof req.body.roles === 'string') {
                try {
                    req.body.roles = JSON.parse(req.body.roles);
                } catch (e) {
                    return res.status(400).send({ error: "Roles must be a valid JSON array1" });
                }
            }
            
            //Validate the parsed roles as an array
            if (!Array.isArray(req.body.roles)) {
                return res.status(400).send({ error: "Roles must be a valid JSON array2" });
            }
            const uservalidation = UserValidator.validate(req.body)
            
            if(uservalidation.error){
                console.log("uservalidation",uservalidation)
                res.status(400).send(generateValidationErrorMessage(uservalidation.error.details))
                return
            }
            const userdata = uservalidation.value
            const Data = req.body;

            console.log("req.file",req.file)
            console.log("userdata",userdata)

            if (req.file) {
                Data.imagePath = 'images/' + req.file.filename; 
            }

            const result = await  userUsecase.createUser(userdata, req.file)

            const jsonString = JSON.stringify(result, getCircularReplacer());
            return res.status(201).send(result);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    // connexion de l'utlisateur
    app.post("/users/auth/login", async (req : Request, res : Response) =>{
        const userUsecase = new UseruseCase(AppDataSource);
        try{
            const useremailvalidation = UserLoginlValidation.validate(req.body)
            
            if(useremailvalidation.error){
                console.log("useremailvalidation",useremailvalidation)
                return res.status(400).send(generateValidationErrorMessage(useremailvalidation.error.details))
            }

            const userdata = useremailvalidation.value;
           
            const user = await  userUsecase.getUserByEmail(userdata.email);
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password for user' });
            }
            // Vérification du mot de passe
            const passwordMatch = bcrypt.compare(userdata.password, user.password);
            if (!passwordMatch) {
                return res.status(400);
            }

            const secret = process.env.ACCESS_TOKEN_SECRET ?? ""
            
            const token = jwt.sign({ userId: user.Id, email: user.email }, secret, { expiresIn: '1d' });

            await AppDataSource.getRepository(Token).save({ token: token, user: user })
            res.status(200).send(user);
        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    // à revoir
    // api pour la déconnecter l'utilisateur
    app.post("/users/auth/logout", async (req: Request, res: Response) => {
        req.session.destroy(function(){
            res.redirect('/auth/login');
          });  
    });

    // obtenir l'utilisateur par l'id de l'utlisateur
    app.get("/users/:Id", async (req: Request , res : Response) =>{
        try{
            const useridvalidation  = UserIdValidation.validate(req.params)
            if(useridvalidation.error){
                res.status(400).send(generateValidationErrorMessage(useridvalidation.error.details))
            }
        
            const userUsecase = new UseruseCase(AppDataSource);
            const userid = useridvalidation.value.Id;
            const user  = await userUsecase.getUserById(userid)
            if (!user) {
                res.status(404).send({ "error": "User not found" });
                return;
            }
            res.status(200).send(user);

        }catch(error){
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    // suppression d'un utlisateur
    app.delete("/users/:Id",authMiddleware,async (req: Request, res : Response) =>{
        
        try{
            const useridvalidation  = UserIdValidation.validate(req.params) 
            if(useridvalidation.error){
                res.status(400).send(generateValidationErrorMessage(useridvalidation.error.details))
            }
            const userUsecase = new UseruseCase(AppDataSource);
            const userid = useridvalidation.value.Id;
            const user  = await userUsecase.DeleteUser(userid)
        
            // Vérifier si l'utilisateur a été supprimé avec succès
            if (user.affected === 0) {
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

    // Route pour mettre à jour les informations de l'utilisateur
    app.put("/users/:Id",authMiddleware, async (req: Request, res: Response) => {
        try {
            const useridvalidation  = UserIdValidation.validate(req.params)
            console.log("userId")
            
            if(useridvalidation.error){
                res.status(400).send(generateValidationErrorMessage(useridvalidation.error.details))
            }
            
            const value =useridvalidation.value;
            // Récupérer l'ID de l'utilisateur à mettre à jour depuis les paramètres de la requête
            const userId = value.Id;
            console.log(userId)
            // Récupérer les données à mettre à jour à partir du corps de la requête
            const updatedData = req.body;
            
            // Vérifier si l'ID de l'utilisateur est un nombre valide
            if (isNaN(userId) || userId <= 0) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Updated data not provided' });
            }

            // Appeler la fonction upDateUserData pour récupérer l'utilisateur à mettre à jour
            const userUsecase = new UseruseCase(AppDataSource);
            
            userUsecase.upDateUserData(userId,updatedData)

            // Répondre avec succès et renvoyer les informations mises à jour de l'utilisateur
            return res.status(200).json({"message":"les information sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to update user:", error);
            return res.status(500).json({ error: 'Internal server error. Please retry later.' });
        }
    });

    // Utility function to handle circular references
function getCircularReplacer() {
    const seen = new WeakSet();
    return (key: any, value: object | null) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
}

}
