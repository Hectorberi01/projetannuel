import { DataSource } from "typeorm";
import { Document } from "../database/entities/document";
import { R2 } from "node-cloudflare-r2";
import { Readable } from "stream";
import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { google, drive_v3 } from "googleapis";
import path from "path";
import fs from 'fs';
import { Stream } from "nodemailer/lib/xoauth2";
import dotenv from 'dotenv'
import { Folder } from "../database/entities/Folder";
import { Storage } from '@google-cloud/storage';
import { OAuth2Client } from 'google-auth-library';
import { networksecurity } from "googleapis/build/src/apis/networksecurity";
import { User } from "../database/entities/user";
dotenv.config()

export interface ListDocumentsRequest {
    limit: number;
    page: number;
    userId: number;
}


const KEYFILEPATH = path.join(__dirname, '../../', "sportvision.com.json")
const SCOPES = [
    'https://www.googleapis.com/auth/drive ',
    'https://www.googleapis.com/auth/drive.file'
]
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
})

const CLIENT_ID = '217952883974-nbov9en8884cj3gkvgtvh53ulfr7619r.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04_cki4Tv90-qCgYIARAAGAQSNwF-L9IrCskLzlzPXNUEwGB35OsvITRfeBVKV0h5bRtbcswbHR77ATLwqQT5gX4RhZDX-ZaLQbg'

/****************************************************************************************** */

export class DocumentUseCase {

    private driveClient: any;
    private oauth2Client: OAuth2Client;


    constructor(private readonly db: DataSource) {
        this.oauth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );
        this.oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

        this.initDriveClient();
    }

    /**
    * Initialisation des parametre de connexion pour l'utilisation de l'API GOOGLE Drive
    */
    initDriveClient() {
        const CLIENT_ID = '217952883974-nbov9en8884cj3gkvgtvh53ulfr7619r.apps.googleusercontent.com';
        const CLIENT_SECRET = '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';
        const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
        const REFRESH_TOKEN = '1//04_cki4Tv90-qCgYIARAAGAQSNwF-L9IrCskLzlzPXNUEwGB35OsvITRfeBVKV0h5bRtbcswbHR77ATLwqQT5gX4RhZDX-ZaLQbg';

        this.oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        this.oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

        this.driveClient = google.drive({ version: 'v3', auth: this.oauth2Client });
    }

   /**
    * cette methode renvoie la liste des documents ainsi que les documents rattacher
    * à un utilisateur. Si l'utilisateur est un admin, il pourra voir tout les documents et dossier
    * Si ADMIN_FORMATIONCENTER il verra la liste des (files & doc) de tout les utilisateurs ayant pour 
    * role ADMIN_FORMATIONCENTER et FORMATIONCENTER
    * il est de même pour ADMIN_CLUB,
    * pour les utilisateurs simple n'ayant pas de role admin il verrons que leurs propre (doc &files)
    * @param listDocuments 
    * @param userRole 
    * @returns 
    */
    async getAllDocuments(listDocuments: ListDocumentsRequest, userRole: string): Promise<{ documents: Document[], folders: Folder[], totalDocuments: number, totalFolders: number }> {
    
        let documentsQuery = this.db.getRepository(Document).createQueryBuilder('document')
            .leftJoinAndSelect('document.user', 'user');
        
        let foldersQuery = this.db.getRepository(Folder).createQueryBuilder('folder')
            .leftJoinAndSelect('folder.user', 'user');

        if (userRole === 'ADMIN') {
            documentsQuery = documentsQuery
            foldersQuery = foldersQuery
        }else if (userRole === 'ADMIN_CLUB') {

            documentsQuery = documentsQuery.where('user.role = :role', { role: 'CLUB' });
            foldersQuery = foldersQuery.where('user.role = :role', { role: 'CLUB' });

        }else if (userRole === 'ADMIN_FORMATIONCENTER') {

            documentsQuery = documentsQuery.where('user.role = :role', { role: 'FORMATIONCENTER' });
            foldersQuery = foldersQuery.where('user.role = :role', { role: 'FORMATIONCENTER' });

        } else if (userRole === 'CLUB' || userRole === 'FORMATIONCENTER') {

            documentsQuery = documentsQuery.where('user.id = :userId', { userId: listDocuments.userId });
            foldersQuery = foldersQuery.where('user.id = :userId', { userId: listDocuments.userId });

        } else {
            throw new Error('Invalid role');
        }
        
        documentsQuery.skip((listDocuments.page - 1) * listDocuments.limit).take(listDocuments.limit);
        foldersQuery.skip((listDocuments.page - 1) * listDocuments.limit).take(listDocuments.limit);

        const [documents, totalDocuments] = await documentsQuery.getManyAndCount();
        const [folders, totalFolders] = await foldersQuery.getManyAndCount();

        return {
            documents ,
            folders,
            totalDocuments,
            totalFolders
        };
    }

    /**
    * Permet de récupérer un document par son ID
    * @param documentId Id qui corresponds au document
    * @returns 
    */
    async getDocumentById(documentId: number): Promise<Document> {
        const documentRepository = this.db.getRepository(Document);

        const document = await documentRepository.findOne({
            where: { id: documentId }
        });

        if (!document) {
            throw new Error(`Document with id ${documentId} not found`);
        }

        return document;
    }


    /**
    * Téléchargement du document depuis google grive
    * @param documentId Id du document en base de données et non l'id google grive 
    * @returns le document en format buffer
    */
    async downloadFile(documentId: number): Promise<Readable> {
        try {
            const documentRepository = this.db.getRepository(Document)
            const document = await documentRepository.createQueryBuilder('document')
                .leftJoinAndSelect('document.folder', 'folder')
                .where('document.id = :id', { id: documentId })
                .getOne();

            console.log("documentone", document)

            if (!document) {
                throw new Error(`Invalid document id =${documentId}`)
            }

            // on récupère l'id google drive rattacher au document 
            const fileId = document.filegoogleId

            if (!fileId) {
                throw new Error(`Invalid file ID for document id = ${documentId}`)
            }
            console.log("fileId", fileId)

            try {
                const response = await this.driveClient.files.get({
                    fileId: fileId,
                    alt: 'media',
                }, { responseType: 'stream' });

                console.log("bb", response.data);

                return response.data as Readable;

            } catch (error) {
                throw new Error(`${error}`)
            }

        } catch (error) {
            console.error('Error fetching file from Google Drive:', error);
            throw new Error(`Error fetching file from Google Drive: ${error}`);
        }
    }

    async readableStreamToNodeStream(readableStream: ReadableStream<Uint8Array>): Promise<Readable> {
        const reader = readableStream.getReader();
        const nodeStream = new Readable({
            async read() {
                try {
                    const { done, value } = await reader.read();
                    if (done) {
                        this.push(null);
                    } else {
                        this.push(Buffer.from(value));
                    }
                } catch (error: any) {
                    this.destroy(error);
                }
            }
        });

        return nodeStream;
    }


    /**
     * Création d'un dossier dans google drive 
     * @param foldername nom du dossier 
     * @returns  Folder 
     */
    async createFolder(foldername: string, userId: number) {

        const fileMetadata = {
            name: foldername,
            mimeType: 'application/vnd.google-apps.folder',
        };

        try {
            const file = await this.driveClient.files.create({
                resource: fileMetadata,
                fields: 'id',
            });

            console.log('Folder Id:', file.data.id);

            await this.driveClient.permissions.create({
                fileId: file.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            const userRepository = this.db.getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error(`User not found: ${userId}`);
            }

            const folderRepository = this.db.getRepository(Folder)
            const folder = new Folder()
            folder.name = foldername
            folder.googleId = file.data.id
            folder.user = user

            return await folderRepository.save(folder)
        } catch (err) {
            throw err;
        }
    }


    /**
     * Cette méthode permet de télécharger le fichier dans un dossier spécifique
     * @param folderId  l'id google drive qui corespond au dossier 
     * @param file le fichier à télécharger dans google drive
     * @returns l'objet document et l'url complet de drive qui corresponds au fichier
     */
    async uploadToFolder(folderId: string, file: Express.Multer.File, userId: number) {

        const folderRepository = this.db.getRepository(Folder)

        const folder = await folderRepository.findOne({
            where: { googleId: folderId },
            relations: ['user']
        })

        if (!folder) {
            throw new Error(`Folder with Google Drive ID ${folderId} not found in the database`);
        }

        if (folder.user.id !== userId) {
            throw new Error('You do not have permission to upload files to this folder');
        }

        // Vérifiez si le dossier existe
        try {
            await this.driveClient.files.get({ fileId: folderId });
        } catch (error) {
            throw new Error(`Folder not found: ${folderId}`);
        }

        // Créez le flux du fichier
        const bufferStream = new Stream.PassThrough();
        bufferStream.end(file.buffer);

        // Téléchargez le fichier sur Google Drive
        const { data } = await this.driveClient.files.create({
            media: {
                mimeType: file.mimetype,
                body: bufferStream,
            },
            requestBody: {
                name: file.originalname,
                parents: [folderId],
            },
            fields: "id,name,mimeType",
        });

        console.log(`Uploaded file ${data.name} ${data.id}`);

        await this.driveClient.permissions.create({
            fileId: data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        //Enrégistrer les informations en base de données 
        const documentRepository = this.db.getRepository(Document);
        const document = new Document();
        document.name = file.originalname;
        document.type = 'player_detection_football';
        document.path = `https://drive.google.com/file/d/${data.id}`;
        document.filegoogleId = data.id
        document.folder = folder

        const userRepository = this.db.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }
        document.user = user;

        const savedDocument = await documentRepository.save(document);
        const viewUrl = `https://drive.google.com/file/d/${data.id}/view?usp=sharing`;

        return { document: savedDocument, viewUrl };
    }


    /**
    * Cette méthode permet de déplacer le fichier dans un autre dossier 
    * @param folderId  l'id google drive qui corespond au dossier dans google drive
    * @param fileId l'id google drive qui corespond au fichier dans google drive
    * @param userId identifian de l'utilisateur 
    * @returns l'objet document et l'url complet de drive qui corresponds au fichier
    */
    async moveFileToFolder(fileId: string, folderId: string, userId: number) {
        const folderRepository = this.db.getRepository(Folder);
        const documentRepository = this.db.getRepository(Document);

        const folder = await folderRepository.findOne({
            where: { googleId: folderId },
            relations: ['user']
        });

        if (!folder) {
            throw new Error(`Folder with Google Drive ID ${folderId} not found in the database`);
            return
        }
    
        if (folder.user.id !== userId) {
            throw new Error('You do not have permission to move files to this folder');
        }

        const document = await documentRepository.findOne({
            where: { filegoogleId: fileId },
            relations: ['user']
        });
    
        if (!document) {
            throw new Error(`Document with Google Drive ID ${fileId} not found in the database`);
        }
    
        if (document.user.id !== userId) {
            throw new Error('You do not have permission to move this file');
        }
    

        try {
            // Retrieve the existing parents to remove
            const file = await this.driveClient.files.get({
                fileId: fileId,
                fields: 'parents',
            });

            // Move the file to the new folder
            const previousParents = file.data.parents
                .join(',');
            const files = await this.driveClient.files.update({
                fileId: fileId,
                addParents: folderId,
                removeParents: previousParents,
                fields: 'id, parents',
            });

            document.folder = folder;
            await documentRepository.save(document);

            console.log(files.status);
            return files.status;
        } catch (err) {

            throw err;
        }
    }
}
