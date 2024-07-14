import express from "express";
import multer from "multer";
import {AppDataSource} from "../database/database";
import {ImageUseCase} from "../domain/image-usecase";
import {idClubValidation} from "./validator/club-validator";
import {UseruseCase} from "../domain/user-usecase";
import {FormationCenterUseCase} from "../domain/formationcenter-usecase";
import {ClubUseCase} from "../domain/club-usecase";
import {PlayerUseCase} from "../domain/player-usercase";
import {playerImageValidation} from "./validator/image-validator";

const upload = multer({dest: 'uploads/'});

export const imageRoute = (app: express.Express) => {
    const imageUseCase = new ImageUseCase(AppDataSource);

    app.post("/images", upload.single('image'), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send("No file uploaded");
            }

            const image = await imageUseCase.createImage(file);
            res.status(201).send(image);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    });

    app.post("/images/user/:id", upload.single('image'), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send("No file uploaded");
            }

            const idUserValidation = idClubValidation.validate(req.params);
            if (!idUserValidation) {
                return res.status(400).send("ID user unvalid");
            }
            const useCase = new UseruseCase(AppDataSource);
            const result = await useCase.modifyUserProfilePicture(idUserValidation.value.id, file);
            res.status(201).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.post("/images/formation-center/:id", upload.single('image'), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send("No file uploaded");
            }

            const idUserValidation = idClubValidation.validate(req.params);
            if (!idUserValidation) {
                return res.status(400).send("ID user unvalid");
            }
            const useCase = new FormationCenterUseCase(AppDataSource);
            const result = await useCase.modifyFormationCenterPicture(idUserValidation.value.id, file);
            res.status(201).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.post("/images/club/:id", upload.single('image'), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send("No file uploaded");
            }

            const idUserValidation = idClubValidation.validate(req.params);
            if (!idUserValidation) {
                return res.status(400).send("ID user unvalid");
            }
            const useCase = new ClubUseCase(AppDataSource);
            const result = await useCase.modifyClubPicture(idUserValidation.value.id, file);
            res.status(201).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.post("/images/player/:id/:index", upload.single('image'), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send("No file uploaded");
            }

            const playerImageValidate = playerImageValidation.validate(req.params);
            if (!playerImageValidate) {
                return res.status(400).send("ID user unvalid");
            }
            const useCase = new PlayerUseCase(AppDataSource);
            const result = await useCase.modifyPlayerPicture(playerImageValidate.value.id,playerImageValidate.value.index,  file);
            res.status(201).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })
};
