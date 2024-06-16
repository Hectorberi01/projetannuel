import express, {NextFunction, Request, Response} from "express";
import {EventIdValidation, EventValidator, listEventValidation} from "./validator/events-validator";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {AppDataSource} from "../database/database";
import {EventuseCase} from "../domain/events-usecase";


export const eventsRoutes = (app: express.Express) => {

    app.get("/events", async (req: Request, res: Response) => {
        const eventvalidator = listEventValidation.validate(req.query);
        if (eventvalidator.error) {
            res.status(400).send({
                error: "Invalid query parameters",
                details: eventvalidator.error.details
            });
            return;
        }

        const listeventRequest = eventvalidator.value;
        const limit = listeventRequest.limit ?? 50;
        const page = listeventRequest.page ?? 1;

        const eventUseCase = new EventuseCase(AppDataSource);

        try {
            const listEvent = await eventUseCase.getAllEvents({...listeventRequest, page, limit});
            res.status(200).send(listEvent);
        } catch (error) {
            console.log('Error fetching events:', error);
            res.status(500).send({"error": "Internal error for list event, please retry later"});
        }
    });

    app.get("/events/recents", async (req: Request, res: Response) => {

        try {
            const eventUseCase = new EventuseCase(AppDataSource);
            const result = await eventUseCase.getRecentsEvents();
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    })

    app.get("/events/:Id", async (req: Request, res: Response) => {
        try {
            const eventidvalidation = EventIdValidation.validate(req.params)

            if (eventidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventidvalidation.error.details))
            }

            const eventUsecase = new EventuseCase(AppDataSource);
            const value = eventidvalidation.value.Id;
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
            const eventvalidation = EventValidator.validate(req.body)
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

    app.put("/events/:Id", async (req: Request, res: Response) => {
        try {
            const eventidvalidation = EventIdValidation.validate(req.params)

            if (eventidvalidation.error) {
                console.log("eventidvalidation", eventidvalidation)
                res.status(400).send(generateValidationErrorMessage(eventidvalidation.error.details))
            }

            const value = eventidvalidation.value;
            // Récupérer l'ID de l'utilisateur à mettre à jour depuis les paramètres de la requête
            const eventId = value.Id;
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

            eventUsecase.updateEvent(eventId, updatedData)

            // Répondre avec succès et renvoyer les informations mises à jour de l'utilisateur
            return res.status(200).json({"message": "les information sont enrégistées avec succès"});
        } catch (error) {
            console.error("Failed to update user:", error);
            return res.status(500).json({error: 'Internal server error. Please retry later.'});
        }
    });

    app.delete("/events/:Id", async (req: Request, res: Response) => {
        try {
            const eventidvalidation = EventIdValidation.validate(req.params)

            if (eventidvalidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventidvalidation.error.details))
            }

            const eventUsecase = new EventuseCase(AppDataSource);
            const userid = eventidvalidation.value.Id;
            const event = await eventUsecase.deleteEvent(userid)

            // Vérifier si l'utilisateur a été supprimé avec succès
            if (event.affected === 0) {
                return res.status(404).json({error: 'User not found'});
            }
            // Répondre avec succès
            return res.status(200).json({message: 'User deleted successfully'});
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.put("/events/:Id/cancel", async (req: Request, res: Response) => {
        try {
            const idEventValidate = EventIdValidation.validate(req.params);

            if (idEventValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idEventValidate.error.details))
            }

            const eventUseCase = new EventuseCase(AppDataSource);
            const result = await eventUseCase.cancelEvent(idEventValidate.value.Id);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).json(error.message);
        }
    })

}
