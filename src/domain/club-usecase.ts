import { DataSource, DeleteResult, EntityNotFoundError } from "typeorm";
import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";
import { Club } from "../database/entities/club";
import { ClubRequest } from "../handlers/validator/club-validator";
import { SportUseCase } from "./sport-usecase";
import { Sport } from "../database/entities/sport";

export interface ListClubUseCase {
    limit: number;
    page: number;
}
export class ClubUseCase{

    constructor(private readonly db: DataSource){}

    async ListeClub(listeclub: ListClubUseCase): Promise<{ club: Club[], total: number }> {
        const query = this.db.getRepository(Club).createQueryBuilder('club');

        query.skip((listeclub.page - 1) * listeclub.limit);
        query.take(listeclub.limit);

        const [club, total] = await query.getManyAndCount();
        return {
            club,
            total
        };
    }
    async CreatClub(clubData :ClubRequest ):Promise<Club | Error>{
        try{
            const newClubRepository  = this.db.getRepository(Club);
            const sportUsecase = new SportUseCase(AppDataSource);
            const newClub = new Club();

            newClub.Id = clubData.Id;
            newClub.Name = clubData.Name;
            newClub.Adress = clubData.Adress;
            newClub.Sports = clubData.Sports;
            newClub.Id_Image = clubData.Id_Image;
            newClub.creation_date = clubData.creation_date;
            newClub.events = clubData.events
            return newClubRepository.save(newClub);
        }catch(error){
            console.error("Failed to creat club account :", error);
            throw error;
        }
        
    }

    async getClubById(id_club: number): Promise<Club> {
        const ClubRepository  = this.db.getRepository(Club);

        const club = await ClubRepository.findOne({
            where: { Id: id_club },
            relations: ['Sports']
        });
        if (!club) {
            throw new EntityNotFoundError(Club, id_club);
        }
        return club;
    }

    async DeleteClub(id_club : number): Promise<DeleteResult>{

        const ClubRepository  = this.db.getRepository(Club);

        try {
            const result = await this.getClubById(id_club);
            if(result == null){
                throw new Error(`${id_club} not found`);
            }

            return await ClubRepository.delete(id_club);
        } catch (error) {
            console.error("Failed to delete club with ID:", id_club, error);
            throw error;
        }

    }

    async upDateClubData(id_club : number,info : any){
        try{
            const ClubRepository = this.db.getRepository(Club)
            console.log("info",info)
            const result  = await this.getClubById(id_club)
            console.log("result",result)

            if(result instanceof Club){
                const club = result;
                console.log("planning = result",club)
                Object.assign(club, info);
                console.log("id_planning",club)
               await ClubRepository.save(club) 
            }else {
                throw new Error('planning not found');
            }
        }catch(error){
            console.error("Failed to update planning with ID:", id_club, error);
        }
    }
}