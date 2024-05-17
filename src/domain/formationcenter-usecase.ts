import { DataSource, DeleteResult, EntityNotFoundError } from "typeorm";
import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";
import { FormationCenterRequest } from "../handlers/validator/formation-validator";
import { SportUseCase } from "./sport-usecase";
import{FormationCenter} from "../database/entities/formationcenter"
import { Sport } from "../database/entities/sport";

export interface ListFormationCenterCase {
    limit: number;
    page: number;
}

export class FormationCenterUserCase{

    constructor(private readonly db: DataSource){}

    async ListeFormationCenter(listformation: ListFormationCenterCase): Promise<{ formation: FormationCenter[], total: number }> {
        const query = this.db.getRepository(FormationCenter).createQueryBuilder('FormationCenter')
        .leftJoinAndSelect('FormationCenter.Sports', 'sport');


        query.skip((listformation.page - 1) * listformation.limit);
        query.take(listformation.limit);

        const [formation, total] = await query.getManyAndCount();
        return {
            formation,
            total
        };
    }
    async CreatFormationCenter(formationData :FormationCenterRequest ):Promise<FormationCenter | Error>{
        try{
            const formationRepository  = this.db.getRepository(FormationCenter);
            const sportUsecase = new SportUseCase(AppDataSource);
            const newFormation = new FormationCenter();

            newFormation.Id = formationData.Id;
            newFormation.Name = formationData.Name;
            newFormation.Adress = formationData.Adress;
            newFormation.Sports = formationData.Sports;
            newFormation.Email = formationData.Email;
            newFormation.Id_Image = formationData.Id_Image;
            newFormation.Creation_Date = formationData.Creation_Date

            return formationRepository.save(newFormation);
        }catch(error){
            console.error("Failed to creat club account :", error);
            throw error;
        }
        
    }

    async getFormationCenterById(id_formation: number): Promise<FormationCenter> {
        const formationRepository  = this.db.getRepository(FormationCenter);

        const club = await formationRepository.findOne({
            where: { Id: id_formation },
            relations: ['Sports']
        });
        if (!club) {
            throw new EntityNotFoundError(FormationCenter, id_formation);
        }
        return club;
    }

    async DeleteFormationCenter(id_formation : number): Promise<DeleteResult>{

        const formationRepository  = this.db.getRepository(FormationCenter);

        try {
            const result = await this.getFormationCenterById(id_formation);
            if(result == null){
                throw new Error(`${id_formation} not found`);
            }

            return await formationRepository.delete(id_formation);
        } catch (error) {
            console.error("Failed to delete formation center with ID:", id_formation, error);
            throw error;
        }

    }

    async upDateFormationCenterData(id_formation : number,info : any){
        try{
            const ClubRepository = this.db.getRepository(FormationCenter)
            console.log("info",info)
            const result  = await this.getFormationCenterById(id_formation)
            console.log("result",result)

            if(result instanceof FormationCenter){
                const club = result;
                console.log("planning = result",club)
                Object.assign(club, info);
                console.log("id_planning",club)
               await ClubRepository.save(club) 
            }else {
                throw new Error('planning not found');
            }
        }catch(error){
            console.error("Failed to update formation center with ID:", id_formation, error);
        }
    }
}