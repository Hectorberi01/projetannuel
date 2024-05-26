import { DataSource, DeleteResult, EntityNotFoundError, In } from "typeorm";
import express, { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { Club } from "../database/entities/club";
import { ClubRequest } from "../handlers/validator/club-validator";
import { SportUseCase } from "./sport-usecase";
import { Sport } from "../database/entities/sport";
import { Image } from "../database/entities/image";

export interface ListClubUseCase {
    limit: number;
    page: number;
}
export class ClubUseCase {

    constructor(private readonly db: DataSource) { }

    async ListeClub(listeclub: ListClubUseCase): Promise<{ club: Club[], total: number }> {
        const query = this.db.getRepository(Club).createQueryBuilder('club')
        .leftJoinAndSelect('club.events', 'event')
        .leftJoinAndSelect('club.Image', 'image')
        .leftJoinAndSelect('club.Sports', 'sport')
        .skip((listeclub.page - 1) * listeclub.limit)
        .take(listeclub.limit);

        // query.skip((listeclub.page - 1) * listeclub.limit);
        // query.take(listeclub.limit);

        const [club, total] = await query.getManyAndCount();
        return {
            club,
            total
        };
    }

    // création de club
    async CreatClub(clubData: ClubRequest, info: any): Promise<ClubDTO | Error> {
        const newClubRepository = this.db.getRepository(Club);
        const sportUsecase = new SportUseCase(AppDataSource);
        const imageRepository = this.db.getRepository(Image);
        const sportRepository = this.db.getRepository(Sport)
        let image: Image | null = null;
        console.log("info",info)
        try {
            if (info.imagePath) {
                image = new Image();
                image.url = info.imagePath;
                await imageRepository.save(image);
            }

            const queryRunner = this.db.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const newClub = new Club();

                // Assigner les informations au nouveau club
                Object.assign(newClub, info);

                const sportIds = info.Sport.map((sport: Sport) => sport.Id)
                const sports = await sportRepository.find({
                    where : {Id : In(sportIds)}
                })
                newClub.Sports = sports

                // Si une image a été créée, l'associer au club
                if (image) {
                    newClub.Image = image;
                    image.club = newClub;
                    await queryRunner.manager.save(image);
                }

                // Sauvegarder le nouveau club
                await queryRunner.manager.save(newClub);
                await queryRunner.commitTransaction();

                return this.clubToDTO(newClub);
            } catch (error) {
                await queryRunner.rollbackTransaction();
                console.error("Failed to creat club :", error);
                throw error;
            } finally {
                await queryRunner.release();
            }

        } catch (error) {
            console.error("Failed to creat club account :", error);
            throw error;
        }

    }

    async getClubById(id_club: number): Promise<Club> {
        const ClubRepository = this.db.getRepository(Club);

        const club = await ClubRepository.findOne({
            where: { Id: id_club },
            relations: ['Sports', 'events', 'Image']
        });
        if (!club) {
            throw new EntityNotFoundError(Club, id_club);
        }
        return club;
    }

    async DeleteClub(id_club: number): Promise<DeleteResult> {

        const ClubRepository = this.db.getRepository(Club);

        try {
            const result = await this.getClubById(id_club);
            if (result == null) {
                throw new Error(`${id_club} not found`);
            }

            return await ClubRepository.delete(id_club);
        } catch (error) {
            console.error("Failed to delete club with ID:", id_club, error);
            throw error;
        }
    }

    async upDateClubData(id_club: number, info: any) {
        const imageRepository = this.db.getRepository(Image);
        const ClubRepository = this.db.getRepository(Club)

        try {

            let image = null;
            if (info.imagePath) {
                image = new Image();
                image.url = info.imagePath;
                await imageRepository.save(image);
            }

            const queryRunner = this.db.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            
            try{
                console.log("info", info)
                const club = await this.getClubById(id_club)
                console.log("result", club)

                if (!club) {
                    throw new EntityNotFoundError(club, id_club);
                }

                Object.assign(club, info);

                if (image) {
                    club.Image = image;
                    image.club = club;
                    await queryRunner.manager.save(image);
                }
    
                await queryRunner.manager.save(club);
                await queryRunner.commitTransaction();
            }catch(error){
                await queryRunner.rollbackTransaction();
                console.error("Failed to update club with ID:", id_club, error);
                throw error;
            }finally{
                await queryRunner.release();
            }

        } catch (error) {
            console.error("Failed to update club with ID:", id_club, error);
        }
    }

    // Fonction pour convertir une entité Club en DTO
    clubToDTO(club: Club): ClubDTO {
        return {
            Id: club.Id,
            Name: club.Name,
            Address: club.Address,
            Email: club.Email,
            creation_date: club.creation_date,
            image: club.Image ? {
                Id: club.Image.Id,
                url: club.Image.url
            } : null,
            Sports: club.Sports ? club.Sports.map(sport => ({
                Id: sport.Id,
                Name: sport.Name
            })) : [],
            events: club.events ? club.events.map(event => ({
                Id: event.Id,
                title: event.title,
                description: event.description,
                startDate: event.startDate,
                endDate: event.endDate,
                lieu: event.lieu,
                type: event.type,
                recurrence: event.recurrence,
                activity: event.activity,
                capacity: event.capacity,
                statut: event.statut
            })) : []
        };
    }
    
}

type SportDTO = {
    Id: number;
    Name: string;
};

type EventDTO = {
    Id: number;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    lieu: string;
    type: string;
    recurrence: string;
    activity: string;
    capacity: number;
    statut: string;
};

type ClubDTO = {
    Id: number;
    Name: string;
    Address: string;
    Email: string;
    creation_date: Date;
    image: { Id: number; url: string; } | null;
    Sports: SportDTO[];
    events: EventDTO[];
};