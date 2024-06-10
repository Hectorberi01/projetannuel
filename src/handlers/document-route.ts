import express, {Request, Response} from "express";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {createDocumentValidation, idDocumentValidation, listDocumentValidation} from "./validator/document-validator";
import {AppDataSource} from "../database/database";
import {DocumentUseCase} from "../domain/documents-usecase";
import {upload} from "../middlewares/multer-config";


export const documentsRoutes = (app: express.Express) => {

    app.get('/documents/:id', async (req: Request, res: Response) => {

        try {
            const idDocumentValidate = idDocumentValidation.validate(req.params);

            if (idDocumentValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idDocumentValidate.error.details));
            }

            const documentUseCase = new DocumentUseCase(AppDataSource);
            const result = await documentUseCase.getDocumentById(idDocumentValidate.value)
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.get('/documents/:id/download', async (req: Request, res: Response) => {

        try {
            const idDocumentValidate = idDocumentValidation.validate(req.params);

            if (idDocumentValidate.error) {
                res.status(400).send(generateValidationErrorMessage(idDocumentValidate.error.details));
            }

            const documentUseCase = new DocumentUseCase(AppDataSource);
            const result = await documentUseCase.getDocumentStream(idDocumentValidate.value.id)
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.get("/documents", async (req: Request, res: Response) => {
        try {
            const listDocumentValidate = listDocumentValidation.validate(req.body);

            if (listDocumentValidate.error) {
                res.status(400).send(generateValidationErrorMessage(listDocumentValidate.error.details))
            }

            let limit = 50
            if (listDocumentValidate.value.limit) {
                limit = listDocumentValidate.value.limit;
            }
            const page = listDocumentValidate.value.page ?? 1

            const documentUseCase = new DocumentUseCase(AppDataSource)
            const listClubs = await documentUseCase.getAllDocuments({...listDocumentValidate, page, limit})
            res.status(200).send(listClubs)
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    });

    app.post("/documents", upload.single('file'), async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                res.status(400).send({ error: "File is required" });
                return;
            }

            const { error } = createDocumentValidation.validate({ file: req.file });
            if (error) {
                res.status(400).send(generateValidationErrorMessage(error.details));
                return;
            }

            const documentUseCase = new DocumentUseCase(AppDataSource);
            const result = await documentUseCase.createDocument(req.file);
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    });
}
