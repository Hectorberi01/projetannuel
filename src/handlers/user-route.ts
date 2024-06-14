import express, {Request, Response} from "express";

import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {AppDataSource} from "../database/database";
import {UseruseCase} from "../domain/user-usecase";
import {
    a2fUserValidation,
    changePasswordValidation,
    createUserValidation,
    fcUserValidation,
    idUserValidation,
    listUserValidation,
    loginUserValidation
} from "./validator/user-validator";
import {upload} from "../middlewares/multer-config";

export const userRoutes = (app: express.Express) => {

    //Obternir la liste de tout les utlisateurs
    app.get("/users", async (req: Request, res: Response) => {
        try {
            const listUserValidate = listUserValidation.validate(req.query)
            if (listUserValidate.error) {
                res.status(400).send(generateValidationErrorMessage(listUserValidate.error.details))
                return
            }

            let limit = 50
            if (listUserValidate.value.limit) {
                limit = listUserValidate.value.limit
            }
            const page = listUserValidate.value.page ?? 1
            const userUseCase = new UseruseCase(AppDataSource)
            const listUser = await userUseCase.getAllUsers({...listUserValidate, page, limit})
            res.status(200).send(listUser)
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.get("/users/recents", async (req: Request, res: Response) => {

        try {
            const userUseCase = new UseruseCase(AppDataSource);
            const result = await userUseCase.getRecentUsers();
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.post("/users/auth/signup", upload.single('image'), async (req: Request, res: Response) => {
        try {
            const createUserValidate = createUserValidation.validate(req.body);

            if (createUserValidate.error) {
                return res.status(400).send(generateValidationErrorMessage(createUserValidate.error.details));
            }

            const userUseCase = new UseruseCase(AppDataSource);
            const result = await userUseCase.createUser(createUserValidate.value, req.file);
            return res.status(200).send(result);
        } catch (error) {
            return res.status(500).send(error);
        }
    });

    app.get("/users/:id", async (req: Request, res: Response) => {
        try {
            const idUserValidate = idUserValidation.validate(req.params);
            if (idUserValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idUserValidate.error.details))
            }

            const userUseCase = new UseruseCase(AppDataSource);
            const result = await userUseCase.getUserById(idUserValidate.value.id);
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.post("/users/auth/login", async (req: Request, res: Response) => {
        try {
            const loginUserValidate = loginUserValidation.validate(req.body);

            if (loginUserValidate.error) {
                res.status(400).send(generateValidationErrorMessage(loginUserValidate.error.details));
                return;
            }

            const userUseCase = new UseruseCase(AppDataSource);
            const result = await userUseCase.login(loginUserValidate.value);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    });

    app.put("/users/:id/first-connection", async (req: Request, res: Response) => {
        try {
            const idUserValidate = idUserValidation.validate(req.params);

            if (idUserValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idUserValidate.error.details));
            }

            const fcUserValidate = fcUserValidation.validate(req.body);

            if (fcUserValidate.error) {
                res.status(400).send(generateValidationErrorMessage(fcUserValidate.error.details));
            }

            const userUseCase = new UseruseCase(AppDataSource);
            const result = await userUseCase.changePasswordFirstConnection(idUserValidate.value.id, fcUserValidate.value.password);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    })

    app.put("/users/:id/delete", async (req: Request, res: Response) => {
        try {
            const idUserValidate = idUserValidation.validate(req.params);
            if (idUserValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idUserValidate.error.details));
            }

            const userUseCase = new UseruseCase(AppDataSource);
            const result = await userUseCase.desactivateUserById(idUserValidate.value.id);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    })

    app.put("/users/:id/change-password", async (req: Request, res: Response) => {
        try {
            const idUserValidate = idUserValidation.validate(req.params);
            if (idUserValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idUserValidate.error.details));
            }
            const changePasswordValidate = changePasswordValidation.validate(req.body);
            if (changePasswordValidate.error) {
                res.status(400).send(generateValidationErrorMessage(changePasswordValidate.error.details));
            }
            const userUseCase = new UseruseCase(AppDataSource);
            const result = await userUseCase.changePassword(idUserValidate.value.id, changePasswordValidate.value);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    })

    app.post("/users/auth/verify-a2f", async (req: Request, res: Response) => {
        try {
            const a2fUserValidate = a2fUserValidation.validate(req.body);
            if (a2fUserValidate.error) {
                res.status(400).send(generateValidationErrorMessage(a2fUserValidate.error.details));
            }

            const userUseCase = new UseruseCase(AppDataSource);
            const result = await userUseCase.validateA2FCode(a2fUserValidate.value.userId, a2fUserValidate.value.code);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    })
}
