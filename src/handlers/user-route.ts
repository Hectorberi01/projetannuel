import express, {Request, Response} from "express";
import {
    listUserValidation,
    UserIdValidation,
    UserLoginlValidation,
    UserValidator
} from "../handlers/validator/useraccount-validator"
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {AppDataSource} from "../database/database";
import {UseruseCase} from "../domain/user-usecase";
import bcrypt from 'bcrypt';
import {sign} from 'jsonwebtoken';
import {Token} from "../database/entities/token";

export const userRoutes = (app: express.Express) => {

    //Obternir la liste de tout les utlisateurs
    app.get("/users/account", async (req: Request, res: Response) => {
        try {
            const uservalidator = listUserValidation.validate(req.query)
            const listuserRequest = uservalidator.value
            let limit = 50
            if (listuserRequest.limit) {
                limit = listuserRequest.limit
            }
            const page = listuserRequest.page ?? 1
            try {
                const userUseCase = new UseruseCase(AppDataSource)
                const listUser = await userUseCase.listUser({...listuserRequest, page, limit})
                res.status(200).send(listUser)
            } catch (error) {
                console.log(error)
                res.status(500).send({"error": "internal error for list user retry later"})
                return
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    // pour la création d'un compte utilisateur
    app.post("/users/auth/signup", async (req: Request, res: Response) => {
        try {
            const uservalidation = UserValidator.validate(req.body)
            if (uservalidation.error) {
                res.status(400).send(generateValidationErrorMessage(uservalidation.error.details))
            }

            const userdata = uservalidation.value
            console.log("userdata", userdata)
            if (userdata.Id_Image == null) {
                userdata.Id_Image = 0;
            }
            const userUsecase = new UseruseCase(AppDataSource);
            const result = await userUsecase.createUser(userdata)
            return res.status(201).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    // connexion de l'utlisateur
    app.post("/users/auth/login", async (req: Request, res: Response) => {
        try {
            const useremailvalidation = UserLoginlValidation.validate(req.body)

            if (useremailvalidation.error) {
                return res.status(400).send(generateValidationErrorMessage(useremailvalidation.error.details))
            }

            const userdata = useremailvalidation.value;
            const userUsecase = new UseruseCase(AppDataSource);

            const user = await userUsecase.getUserByEmail(userdata.Email);

            if (!user) {
                return res.status(401).json({error: 'Invalid email or password for user'});
            }
            // Vérification du mot de passe
            const passwordMatch = bcrypt.compare(userdata.Password, user.password);
            if (!passwordMatch) {
                return null;
            }

            const secret = process.env.JWT_SECRET ?? "ABCDEF"

            const token = sign({userId: user.Id, email: user.email}, secret, {expiresIn: '1d'});

            await AppDataSource.getRepository(Token).save({token: token, user: user})
            res.status(200).send(user);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    // à revoir
    // api pour la déconnecter l'utilisateur
    app.post("/users/auth/logout", async (req: Request, res: Response) => {
        req.session.destroy(function () {
            res.redirect('/auth/login');
        });
    });

    // obtenir l'utilisateur par l'id de l'utlisateur
    app.get("/users/:Id", async (req: Request, res: Response) => {
        try {
            const useridvalidation = UserIdValidation.validate(req.params)
            if (useridvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(useridvalidation.error.details))
            }

            const userUsecase = new UseruseCase(AppDataSource);
            const userid = useridvalidation.value.Id;
            const user = await userUsecase.getUserById(userid)
            if (!user) {
                res.status(404).send({"error": "User not found"});
                return;
            }
            res.status(200).send(user);

        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    // suppression d'un utlisateur
    app.delete("/users/:Id", async (req: Request, res: Response) => {

        try {
            const useridvalidation = UserIdValidation.validate(req.params)
            if (useridvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(useridvalidation.error.details))
            }
            const userUsecase = new UseruseCase(AppDataSource);
            const userid = useridvalidation.value.Id;
            const user = await userUsecase.DeleteUser(userid)

            // Vérifier si l'utilisateur a été supprimé avec succès
            if (user.affected === 0) {
                return res.status(404).json({error: 'User not found'});
            }
            // Répondre avec succès
            return res.status(200).json({message: 'User deleted successfully'});
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    // Route pour mettre à jour les informations de l'utilisateur
    app.put("/users/:Id", async (req: Request, res: Response) => {
        try {
            const useridvalidation = UserIdValidation.validate(req.params)
            console.log("userId")

            if (useridvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(useridvalidation.error.details))
            }

            const value = useridvalidation.value;
            // Récupérer l'ID de l'utilisateur à mettre à jour depuis les paramètres de la requête
            const userId = value.Id;
            console.log(userId)
            // Récupérer les données à mettre à jour à partir du corps de la requête
            const updatedData = req.body;

            // Vérifier si l'ID de l'utilisateur est un nombre valide
            if (isNaN(userId) || userId <= 0) {
                return res.status(400).json({error: 'Invalid user ID'});
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({error: 'Updated data not provided'});
            }

            // Appeler la fonction upDateUserData pour récupérer l'utilisateur à mettre à jour
            const userUsecase = new UseruseCase(AppDataSource);

            userUsecase.upDateUserData(userId, updatedData)

            // Répondre avec succès et renvoyer les informations mises à jour de l'utilisateur
            return res.status(200).json({"message": "les information sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to update user:", error);
            return res.status(500).json({error: 'Internal server error. Please retry later.'});
        }
    });

}
