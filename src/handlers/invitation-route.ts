import express, {Request, Response} from "express";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {EventInvitationUseCase} from "../domain/eventinvitation-usecase";
import {AppDataSource} from "../database/database";
import {idInvitationValidation, statusInvitationValidation} from "./validator/invitation-validator";

export const invitationRoute = (app: express.Express) => {

    app.get("/invitations/:id/", async (req: Request, res: Response) => {

        try {
            const idInvitationValidate = idInvitationValidation.validate(req.params);
            if (idInvitationValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idInvitationValidate.error.details))
            }
            const useCase = new EventInvitationUseCase(AppDataSource);
            const result = await useCase.getEventInvitationById(idInvitationValidate.value.id);
            res.status(200).send(result);
        } catch (error: any) {
            return res.status(500).json({message: error.message});
        }
    })

    app.put("/invitations/:id/:status", async (req: Request, res: Response) => {
        try {
            const statusInvitationValidate = statusInvitationValidation.validate(req.params);
            if (statusInvitationValidate.error) {
                res.status(400).send(statusInvitationValidate.error.details)
            }
            const useCase = new EventInvitationUseCase(AppDataSource);
            const result = await useCase.updateInvitation(statusInvitationValidate.value.status, statusInvitationValidate.value.id);
            res.status(200).send(result);
        } catch (error: any) {
            return res.status(500).json({message: error.message});
        }
    })
}