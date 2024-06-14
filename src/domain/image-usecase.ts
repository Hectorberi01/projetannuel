import {Image} from "../database/entities/image";
import {R2} from "node-cloudflare-r2";
import {createReadStream} from "fs";
import {unlink} from "fs/promises";


export class ImageUseCase {

    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    async createImage(file: Express.Multer.File): Promise<Image | Error> {
        try {
            const path = await this.uploadImageR2(file);
            const imageRepository = this.db.getRepository(Image);
            let image = new Image();
            image.name = file.filename;
            image.extension = file.mimetype;
            image.path = path;

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
}