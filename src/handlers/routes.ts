import express, { Request, Response} from "express";
import session from 'express-session';
import {UserValidator, LoginUserValidation}from "./validator/user-validator";
import { generateValidationErrorMessage } from "./validator/generate-validation-message";
import { User } from "../database/entities/useraccount";
import { AppDataSource } from "../database/database";
import { compare, hash} from "bcrypt";
import { sign} from "jsonwebtoken";
import { Token } from "../database/entities/token";
import {UseruseCase, } from "../domain/user-usecase"


export const initRoutes = (app: express.Express) => {
     
    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "hello world hector" })
    })

    //pour créer un utlisateur 
   /* app.post("/users", async (req: Request, res: Response)=>{
     
        try{
            const uservalidator =  UserValidator.validate(req.body)
            if(uservalidator.error){
                res.status(400).send(generateValidationErrorMessage(uservalidator.error.details))
                return
            }
            const userdata = uservalidator.value
            const userUsecase = new UseruseCase(AppDataSource);
            const result = await  userUsecase.createUser(userdata)

           return res.status(201).send(result);

        }catch(error){
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        } 
    })

    // pour la connexion d'un utilisateur
    app.post('/auth/login', async (req: Request, res: Response) => {
        try {

            const validationResult = LoginUserValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const loginUserRequest = validationResult.value
            console.log(loginUserRequest.email)
            // valid user exist
            const user = await AppDataSource.getRepository(User).findOneBy({ email: loginUserRequest.email });

            console.log(user?.lastname)
            if (!user) {
                res.status(400).send({ error: "username or password not valid" })
                return
            }

            // valid password for this user
            const isValid = await compare(loginUserRequest.password, user.password);
            console.log("isValide est :",isValid)
            if (!isValid) {
                res.status(400).send({ error: "username or password not valid" })
                return
            }
            
            const secret = process.env.JWT_SECRET ?? user.email;
            console.log("secret est :",secret)
            // generate jwt
            const token = sign({ userId: user.id, email: user.email }, secret, { expiresIn: '1d' });
            // store un token pour un user
            await AppDataSource.getRepository(Token).save({ token: token, user: user })
            res.status(200).json({ token });
        } catch (error) {
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    app.post('/auth/logout', async (req: Request, res: Response) => {
        //if (checkIfBlacklisted) return res.sendStatus(204);
        try {
            
            if (req.session) {
                console.log("req.session",req.session)
                // Destroy the session
                req.session.destroy(err => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({ error: 'Failed to destroy the session' });
                    }
                    // Optionally redirect to home page or send a success message
                    res.send({ message: 'Logged out successfully' });
                });
            } else {
                res.status(400).send({ error: 'Session not found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal server error' });
        }
    });*/
    
}
