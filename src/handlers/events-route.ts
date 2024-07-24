import express, {NextFunction, Request, Response} from "express";
import {createEventValidation, EventIdValidation, listEventValidation} from "./validator/events-validator";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {AppDataSource} from "../database/database";
import {EventuseCase} from "../domain/events-usecase";
import {EventInvitationUseCase} from "../domain/eventinvitation-usecase";
import {idUserValidation} from "./validator/user-validator";


export const eventsRoutes = (app: express.Express) => {

    app.get("/events/recents", async (req: Request, res: Response) => {

        try {
            const eventUseCase = new EventuseCase(AppDataSource);
            const result = await eventUseCase.getRecentsEvents();
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.get("/events/:id", async (req: Request, res: Response) => {
        try {
            const userIdValidate = idUserValidation.validate(req.params);
            const eventvalidator = listEventValidation.validate(req.query);
            if (eventvalidator.error) {
                res.status(400).send({
                    error: "Invalid query parameters",
                    details: eventvalidator.error.details
                });
                return;
            }

            if (userIdValidate.error) {
                res.status(400).send(generateValidationErrorMessage(userIdValidate.error.details))
            }

            const listeventRequest = eventvalidator.value;
            const limit = listeventRequest.limit ?? 100;
            const page = listeventRequest.page ?? 1;

            const eventUseCase = new EventuseCase(AppDataSource);
            const listEvent = await eventUseCase.getAllEvents({
                ...listeventRequest,
                page,
                limit
            }, userIdValidate.value.id);
            res.status(200).send(listEvent);
        } catch (error) {
            console.log('Error fetching events:', error);
            res.status(500).send({"error": "Internal error for list event, please retry later"});
        }
    });

    app.get("/event/:id", async (req: Request, res: Response) => {
        try {
            const eventidvalidation = EventIdValidation.validate(req.params)

            if (eventidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventidvalidation.error.details))
            }

            const eventUsecase = new EventuseCase(AppDataSource);
            const value = eventidvalidation.value.id;
            console.log("value", value)
            const event = await eventUsecase.getEventById(value)
            if (!event) {
                res.status(404).send({"error": "User not found"});
                return;
            }

            res.status(200).send(event);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }

    })

    app.post("/events", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventvalidation = createEventValidation.validate(req.body)
            if (eventvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventvalidation.error.details))
                return
            }

            const eventdata = eventvalidation.value
            const eventUsecase = new EventuseCase(AppDataSource);
            const result = await eventUsecase.createEvent(eventdata)

            if (result) {
                return res.status(201).send(result);
            } else {
                return res.status(500).send({"error": "Failed to create event"});
            }

        } catch (error) {
            res.status(500).send({"error": "internal error retry later: "})
            return
        }
    })

    app.put("/events/:id", async (req: Request, res: Response) => {
        try {
            const eventidvalidation = EventIdValidation.validate(req.params)

            if (eventidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventidvalidation.error.details))
            }

            const value = eventidvalidation.value;
            // Récupérer l'ID de l'utilisateur à mettre à jour depuis les paramètres de la requête
            const eventId = value.id;
            // Récupérer les données à mettre à jour à partir du corps de la requête
            const updatedData = req.body;

            // Vérifier si l'ID de l'utilisateur est un nombre valide
            if (isNaN(eventId) || eventId <= 0) {
                return res.status(400).json({error: 'Invalid user ID'});
            }

            // Vérifier si les données à mettre à jour sont fournies
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({error: 'Updated data not provided'});
            }

            // Appeler la fonction upDateUserData pour récupérer l'utilisateur à mettre à jour
            const eventUsecase = new EventuseCase(AppDataSource);

            await eventUsecase.updateEvent(eventId, updatedData)

            // Répondre avec succès et renvoyer les informations mises à jour de l'utilisateur
            return res.status(200).json({"message": "les information sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to update user:", error);
            return res.status(500).json({error: 'Internal server error. Please retry later.'});
        }
    });

    app.delete("/events/:id", async (req: Request, res: Response) => {
        try {
            const eventidvalidation = EventIdValidation.validate(req.params)

            if (eventidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventidvalidation.error.details))
            }

            const eventUsecase = new EventuseCase(AppDataSource);
            const result = await eventUsecase.deleteEvent(eventidvalidation.value.id);
            return res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.put("/events/:id/cancel", async (req: Request, res: Response) => {
        try {
            const idEventValidate = EventIdValidation.validate(req.params);

            if (idEventValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idEventValidate.error.details))
            }

            const eventUseCase = new EventuseCase(AppDataSource);
            const result = await eventUseCase.cancelEvent(idEventValidate.value.id);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).json(error.message);
        }
    })

    app.get("/events/:id/invitations", async (req: Request, res: Response) => {

        try {
            const idEventValidate = EventIdValidation.validate(req.params);
            if (idEventValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idEventValidate.error.details))
            }
            const useCase = new EventInvitationUseCase(AppDataSource);
            const result = await useCase.getInvitationByEventId(idEventValidate.value.id);
            res.status(200).send(result);
        } catch (error: any) {
            return res.status(500).json({message: error.message});
        }
    })

    app.put("/events/create-from/proposal/:id", async (req: Request, res: Response) => {
        try {
            const idEventValidate = EventIdValidation.validate(req.params);
            if (idEventValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idEventValidate.error.details))
            }
            const useCase = new EventuseCase(AppDataSource);
            const result = await useCase.createFromEventProposal(idEventValidate.value.id);
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })
}
