import express, {NextFunction, Request, Response} from "express";
import {
    createEventProposalValidation,
    EventProposalIdValidation,
    listEventProposalValidation
} from "./validator/eventproposal-validator";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {AppDataSource} from "../database/database";
import {EventProposalUseCase} from "../domain/eventproposal-usecase";

export const eventProposalRoutes = (app: express.Express) => {

    app.get("/eventproposals", async (req: Request, res: Response) => {
        const eventProposalValidator = listEventProposalValidation.validate(req.query);
        if (eventProposalValidator.error) {
            res.status(400).send({
                error: "Invalid query parameters",
                details: eventProposalValidator.error.details
            });
            return;
        }

        const listEventProposalRequest = eventProposalValidator.value;
        const limit = listEventProposalRequest.limit ?? 50;
        const page = listEventProposalRequest.page ?? 1;

        const eventProposalUseCase = new EventProposalUseCase(AppDataSource);

        try {
            const listEventProposal = await eventProposalUseCase.getAllEventProposals({
                ...listEventProposalRequest,
                page,
                limit
            });
            res.status(200).send(listEventProposal);
        } catch (error) {
            console.log('Error fetching event proposals:', error);
            res.status(500).send({"error": "Internal error for list event proposals, please retry later"});
        }
    });

    app.get("/eventproposals/:id", async (req: Request, res: Response) => {
        try {
            const eventProposalIdValidation = EventProposalIdValidation.validate(req.params);

            if (eventProposalIdValidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventProposalIdValidation.error.details));
                return;
            }

            const eventProposalUseCase = new EventProposalUseCase(AppDataSource);
            const value = eventProposalIdValidation.value.id;
            const eventProposal = await eventProposalUseCase.getEventProposalById(value);
            if (!eventProposal) {
                res.status(404).send({"error": "Event proposal not found"});
                return;
            }

            res.status(200).send(eventProposal);
        } catch (error) {
            console.log(error);
            res.status(500).send({"error": "Internal error, please retry later"});
        }
    });

    app.post("/eventproposals", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventProposalValidation = createEventProposalValidation.validate(req.body);
            if (eventProposalValidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventProposalValidation.error.details));
                return;
            }

            const eventProposalData = eventProposalValidation.value;
            const eventProposalUseCase = new EventProposalUseCase(AppDataSource);
            const result = await eventProposalUseCase.createEventProposal(eventProposalData);

            if (result) {
                return res.status(201).send(result);
            } else {
                return res.status(500).send({"error": "Failed to create event proposal"});
            }

        } catch (error) {
            res.status(500).send({"error": "Internal error, please retry later"});
        }
    });

    app.delete("/eventproposals/:id", async (req: Request, res: Response) => {
        try {
            const eventProposalIdValidation = EventProposalIdValidation.validate(req.params);

            if (eventProposalIdValidation.error) {
                res.status(400).send(generateValidationErrorMessage(eventProposalIdValidation.error.details));
                return;
            }

            const eventProposalUseCase = new EventProposalUseCase(AppDataSource);
            const eventProposalId = eventProposalIdValidation.value.id;
            const deleteResult = await eventProposalUseCase.deleteEventProposal(eventProposalId);

            if (deleteResult.affected === 0) {
                return res.status(404).json({error: 'Event proposal not found'});
            }

            return res.status(200).json({message: 'Event proposal deleted successfully'});
        } catch (error) {
            res.status(500).send({"error": "Internal error, please retry later"});
        }
    });
};
