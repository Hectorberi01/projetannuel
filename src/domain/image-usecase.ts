import { DataSource, EntityNotFoundError } from "typeorm";
import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";
import {Image} from '../database/entities/image'
import { ImageRequest } from "../handlers/validator/image-validator";


export interface ListImageUseCase {
    limit: number;
    page: number;
}

export class ImageUseCase{

    constructor(private readonly db: DataSource){}

    async ListeImage(liste: ListImageUseCase): Promise<{ image: Image[], total: number }> {
        const query = this.db.getRepository(Image).createQueryBuilder('Image')
        .leftJoinAndSelect('image.players','players')
        .leftJoinAndSelect('image.club','club')
        .leftJoinAndSelect('image.user','user')
        .skip((liste.page - 1) * liste.limit)
        .take(liste.limit);

        const [image, total] = await query.getManyAndCount();
        return {
            image,
            total
        };
    }

    async CreatImage(Data :ImageRequest ):Promise<Image | Error>{
        try{
            const imageRepository  = this.db.getRepository(Image);
    
            const newImage = new Image();
    
            newImage.Id = Data.Id;
            newImage.url = Data.url;
            newImage.club = Data.club;
            newImage.players = Data.players;
            newImage.user = Data.user
    
            return imageRepository.save(newImage);
        }catch(error){
            console.error("Failed to creat image");
            throw error;
        }
        
    }

    async getImageById(id: number): Promise<Image> {
        try{
            const imageRepository  = this.db.getRepository(Image);
            const sport = await imageRepository.findOne({
                where: { Id: id }
            });

            if (!sport) {
                throw new EntityNotFoundError(Image, id);
            }
            return sport;
        }catch(error){
            console.error("Failed to image with ID:",id, error);
            throw error;
        }
    }
}