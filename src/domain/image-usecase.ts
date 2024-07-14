import {Image} from "../database/entities/image";
import {R2} from "node-cloudflare-r2";
import {createReadStream} from "fs";
import {unlink} from "fs/promises";
import {DeleteResult, Repository} from "typeorm";


export class ImageUseCase {

    private imageRepository: Repository<Image>;
    private db: any;

    constructor(db: any) {
        this.db = db;
        this.imageRepository = this.db.getRepository(Image);
    }

    async createImage(file: Express.Multer.File): Promise<Image | Error> {
        try {
            const path = await this.uploadImageR2(file);
            const imageRepository = this.db.getRepository(Image);
            let image = new Image();
            image.name = file.filename;
            image.extension = file.mimetype;
            image.path = `${process.env.R2_BUCKET_PUBLIC_URL}${file.filename}`;

            return await imageRepository.save(image);
        } catch (error) {
            throw new Error("Failed to create asked image");
        }
    }

    async uploadImageR2(file: Express.Multer.File): Promise<string> {
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

        return uploadResult.uri;
    }

    async deleteImageR2(image: Image): Promise<void> {
        try {
            const r2 = new R2({
                accountId: process.env.R2_ACCOUNT_ID as string,
                accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
            });
            const bucket = r2.bucket(process.env.R2_BUCKET_NAME as string);
            const deleteResult = await bucket.deleteObject(image.name);
            if (!deleteResult) {
                throw new Error(`Failed to delete document: ${image.name}`);
            }
        } catch (error: any) {
            throw new Error(`Failed to delete image from R2: ${error.message}`);
        }
    }

    async deleteImage(imageId: number): Promise<DeleteResult> {
        try {
            const image = await this.getImageById(imageId);

            if (!image) {
                throw new Error(`${imageId} not found`);
            }
            await this.deleteImageR2(image)
            return await this.imageRepository.delete(imageId);
        } catch (error: any) {
            throw new Error("Impossible de supprimer l'image")
        }
    }

    async getImageById(imageId: number): Promise<Image> {
        try {
            const result = await this.imageRepository.findOne({where: {id: imageId}});
            if (!result) {
                throw new Error(`${imageId} not found`);
            }
            return result;
        } catch (error) {
            throw new Error(`${imageId} not found`);
        }

    }
}