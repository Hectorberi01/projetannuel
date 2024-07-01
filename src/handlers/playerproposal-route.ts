import express, {Request, Response} from "express";
import {AppDataSource} from "../database/database";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {
    createPlayerProposalValidation,
    idPlayerProposalValidation,
    listPlayerProposalValidation
} from "./validator/playerproposal-validator";
import {PlayerProposalUseCase} from "../domain/playerproposal-usecase";


export const playerproposalRoutes = (app: express.Express) => {

    // lister des players proposals
    app.get("/playerProposals", async (req: Request, res: Response) => {
        try {
            const listValidate = listPlayerProposalValidation.validate(req.query)
            const listRequest = listValidate.value
            let limit = 50
            if (listRequest.limit) {
                limit = listRequest.limit
            }
            const page = listRequest.page ?? 1
            const useCase = new PlayerProposalUseCase(AppDataSource)
            const result = await useCase.getAllPlayerProposals({...listRequest, page, limit})
            res.status(200).send(result)
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    });

    // obtenir le player proposal par son id
    app.get("/playerProposals/:id", async (req: Request, res: Response) => {
        try {
            const ppIdValidate = idPlayerProposalValidation.validate(req.params)

            if (ppIdValidate.error) {
                res.status(400).send(generateValidationErrorMessage(ppIdValidate.error.details))
            }
            const useCase = new PlayerProposalUseCase(AppDataSource)
            const result = await useCase.getPlayerProposalById(ppIdValidate.value.id)
            res.status(200).send(result);

        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

    // create une player proposal
    app.post("/playerProposals", async (req: Request, res: Response) => {
        try {
            const createPpValidation = createPlayerProposalValidation.validate(req.body)
            if (createPpValidation.error) {
                res.status(400).send(generateValidationErrorMessage(createPpValidation.error.details))
            }
            const useCase = new PlayerProposalUseCase(AppDataSource)
            const result = await useCase.createPlayerProposal(createPpValidation.value)
            return res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    // créer un joueur avec le player proposal
    app.put("/playerProposals/:id/create", async (req: Request, res: Response) => {
        try {
            const idValidate = idPlayerProposalValidation.validate(req.params)
            if (idValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idValidate.error.details))
            }
            const useCase = new PlayerProposalUseCase(AppDataSource)
            const result = await useCase.createPlayerWProposal(idValidate.value.id);
            return res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })

    app.delete("/playerProposals/:id", async (req: Request, res: Response) => {
        try {
            const idValidate = idPlayerProposalValidation.validate(req.params);
            if (idValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idValidate.error.details));
            }
            const useCase = new PlayerProposalUseCase(AppDataSource);
            const result = await useCase.deletePlayerProposal(idValidate.value.id);
            return res.status(200).send(result);
        } catch (error) {
            res.status(500).send({"error": "internal error retry later"})
        }
    })
}