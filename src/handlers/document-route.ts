import express, {Request, Response} from "express";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {
    createDocumentValidation,
    CreatFolderValidation,
    idDocumentValidation,
    ListDocumentRequest,
    listDocumentValidation,
    moveFileValidation,
    UploadFileToFolderValidation
} from "./validator/document-validator";
import {AppDataSource} from "../database/database";
import {DocumentUseCase} from "../domain/documents-usecase";
//import {upload} from "../middlewares/multer-config";
import {google} from 'googleapis';
import multer from "multer";
import {User} from "../database/entities/user";

const storage = multer.memoryStorage();
const upload = multer({storage: storage});
//const upload = multer({ dest: 'uploads/' });


const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

export const documentsRoutes = (app: express.Express) => {

    // connexion à google
    app.get('/auth/google', (req: Request, res: Response) => {
        console.log("hector")
        const scopes = [
            'https://www.googleapis.com/auth/drive.file'
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
        });

        res.redirect(url);
    });

    app.get('/auth/google/callback', async (req: Request, res: Response) => {
        const code = req.query.code as string;
        try {
            const {tokens} = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            res.send('Authentication successful! You can close this tab.');
        } catch (error) {
            res.status(400).send(`Error during authentication: ${error}`);
        }
    });

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

    /**
     * Télécharger le document dans google drive.
     * @param{Integer} Id du document en base de données et non
     * l'id du fichier dans google drive
     * */
    app.get('/documents/:documentId/download', async (req: Request, res: Response) => {
        const documentId = parseInt(req.params.documentId);
        const documentService = new DocumentUseCase(AppDataSource);

        try {
            const fileStream = await documentService.downloadFile(documentId);
            res.setHeader('Content-Disposition', `attachment; filename=document_${documentId}.png`);
            fileStream.pipe(res);
        } catch (error) {
            res.status(500).send({message: 'Error downloading file'});
        }
    });

    /**
     * liste des documents et dossier il faut passer en paramètre l'id de l'utilisateur
     */
    app.get("/files/:userId", async (req: Request, res: Response) => {
        try {

            const {limit, page} = req.query;
            const userId = parseInt(req.params.userId, 10)

            // Récupérer les informations de l'utilisateur pour déterminer son rôle
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['role']
            });

            if (!user) {
                return res.status(404).send({error: 'User not found'});
            }

            // Validation des paramètres de requête
            const listDocumentValidate = listDocumentValidation.validate({limit, page, userId});

            console.log("listDocumentValidate", listDocumentValidate)
            if (listDocumentValidate.error) {
                return res.status(400).send(generateValidationErrorMessage(listDocumentValidate.error.details));
            }

            const validatedParams = listDocumentValidate.value;
            //let limit = 50
            const documentUseCase = new DocumentUseCase(AppDataSource);

            const listDocumentsRequest: ListDocumentRequest = {
                limit: validatedParams.limit ?? 50,
                page: validatedParams.page ?? 1,
                userId: validatedParams.userId
            };

            console.log('listDocumentsRequest', listDocumentsRequest)
            const listDocuments = await documentUseCase.getAllDocuments(listDocumentsRequest, user.role.role);
            res.status(200).send(listDocuments);
        } catch (error) {
            console.log(error);
            res.status(500).send({"error": "internal error retry later"});
        }
    });

    app.get("/documents", async (req: Request, res: Response) => {
        try {
            const useCase = new DocumentUseCase(AppDataSource);
            const result = await useCase.getAll();
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({"error": "internal error retry later"});
        }
    })

    app.get("/folders", async (req: Request, res: Response) => {
        try {
            const useCase = new DocumentUseCase(AppDataSource);
            const result = await useCase.getAllFolders();
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).send({"error": "internal error retry later"});
        }
    })

    // création de dossier dans google drive
    app.post("/create-folder/:userId", async (req: Request, res: Response) => {
        try {
            // vérification des données 
            const creatfolder = CreatFolderValidation.validate({
                userId: req.params.userId,
                name: req.body.name
            })
            if (creatfolder.error) {
                res.status(400).send(generateValidationErrorMessage(creatfolder.error.details));
                return
            }

            const folder = new DocumentUseCase(AppDataSource)
            const result = await folder.createFolder(creatfolder.value.name, creatfolder.value.userId)
            res.status(200).send(result)
        } catch (error) {
            console.log("la création du dossier à échouié")
            res.status(500).send("la création du document à échoué")
        }
    })


    // mettre le document dans un dossier spécifique dans google drive
    // ici il faut l'id de l'utilisateur et du l'id qui correspond au dossier dans google grive
    app.post("/folders/:folderid/upload/:userId/files", upload.single('file'), async (req: Request, res: Response) => {
        try {
            const UploadFileToFolder = UploadFileToFolderValidation.validate({
                id: req.params.folderid,
                userId: req.params.userId
            })

            if (UploadFileToFolder.error) {
                res.status(400).send(generateValidationErrorMessage(UploadFileToFolder.error.details))
                return
            }
            if (!req.file) {
                res.status(400).send({error: "File is required"});
                return;
            }
            const file = createDocumentValidation.validate({file: req.file});
            if (file.error) {
                res.status(400).send(generateValidationErrorMessage(file.error.details));
                return;
            }

            const folderId = UploadFileToFolder.value.id
            const useCase = new DocumentUseCase(AppDataSource)
            const result = await useCase.uploadToFolder(folderId, req.file, UploadFileToFolder.value.userId)
            res.status(201).send(result)
        } catch (error) {
            res.status(500).send("erreur lors du chargement du fichier")
        }
    });

    // déplacer le fichier dans un autre dossier
    app.post('/files/:userId/move/:fileId/to/:Idfolder', async (req: Request, res: Response) => {
        try {
            // Valider les paramètres de la requête
            const movefilevalidation = moveFileValidation.validate({
                userId: req.params.userId,
                fileId: req.params.fileId,
                folderId: req.params.Idfolder
            });

            if (movefilevalidation.error) {
                return res.status(400).send(generateValidationErrorMessage(movefilevalidation.error.details));
            }

            const userId = parseInt(req.params.userId, 10);
            const fileId = req.params.fileId
            const folderId = req.params.Idfolder

            // Créer une instance de DocumentUseCase
            const documentUseCase = new DocumentUseCase(AppDataSource);

            // Déplacer le fichier dans le dossier
            const result = await documentUseCase.moveFileToFolder(fileId, folderId, userId);

            // Répondre avec le statut du déplacement
            res.status(200).send({status: result});
        } catch (error) {
            console.error('Error moving file:', error);
            res.status(500).send(error);
        }
    });
}
