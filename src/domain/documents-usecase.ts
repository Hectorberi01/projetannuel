import {DataSource} from "typeorm";
import {Document} from "../database/entities/document";
import {R2} from "node-cloudflare-r2";
import {Readable} from "stream";
import {createReadStream} from "fs";
import {unlink} from "fs/promises";

export interface ListDocumentsRequest {
    limit: number;
    page: number;
}

export class DocumentUseCase {

    constructor(private readonly db: DataSource) {
    }

    async getAllDocuments(listDocuments: ListDocumentsRequest): Promise<{ documents: Document[], total: number }> {
        const query = this.db.getRepository(Document).createQueryBuilder('Document');

        query.skip((listDocuments.page - 1) * listDocuments.limit);
        query.take(listDocuments.limit);

        const [documents, total] = await query.getManyAndCount();
        return {
            documents,
            total
        };
    }

    async getDocumentById(documentId: number): Promise<Document> {
        const documentRepository = this.db.getRepository(Document);

        const document = await documentRepository.findOne({
            where: {id: documentId}
        });

        if (!document) {
            throw new Error(`Document with id ${documentId} not found`);
        }

        return document;
    }

    async getDocumentStream(documentId: number): Promise<Readable> {
        const document = await this.getDocumentById(documentId);

        const r2 = new R2({
            accountId: process.env.R2_ACCOUNT_ID as string,
            accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
        });

        const bucket = r2.bucket(process.env.R2_BUCKET_NAME as string);
        const path = `${process.env.R2_BUCKET_PUBLIC_URL}/${document.name}`;
        const response = await fetch(path);
        if (!response.ok || !response.body) {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
        }

        return this.readableStreamToNodeStream(response.body as ReadableStream<Uint8Array>);
    }

    async readableStreamToNodeStream(readableStream: ReadableStream<Uint8Array>): Promise<Readable> {
        const reader = readableStream.getReader();
        const nodeStream = new Readable({
            async read() {
                try {
                    const {done, value} = await reader.read();
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

    async createDocument(file: Express.Multer.File): Promise<Document> {
        const r2 = new R2({
            accountId: process.env.R2_ACCOUNT_ID as string,
            accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
        });

        const bucket = r2.bucket(process.env.R2_BUCKET_NAME as string);

        const stream = createReadStream(file.path);
        const uploadResult = await bucket.upload(stream, file.filename);

        if (!uploadResult) {
            throw new Error(`Failed to upload document: ${file.filename}`);
        }

        await unlink(file.path);

        const documentRepository = this.db.getRepository(Document);
        const document = new Document();
        document.name = file.originalname;
        document.type = 'player_detection_football';
        document.path = uploadResult.uri;

        return documentRepository.save(document);
    }
}