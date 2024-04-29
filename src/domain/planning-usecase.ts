import { DataSource, DeleteResult, EntityNotFoundError} from "typeorm";
import {Planning} from "../database/entities/planning"
import {PlanningRequest} from "../handlers/validator/planning-validator"
import { User } from "../database/entities/useraccount";
import { AppDataSource } from "../database/database";
import { UseruseCase } from "./user-usecase";

export interface ListPlanningUseCase {
    limit: number;
    page: number;
}
export class PlanninguseCase{
    constructor(private readonly db: DataSource){}

    async ListePlanning(listeplanning: ListPlanningUseCase): Promise<{ planning: Planning[], total: number }> {
        const query = this.db.getRepository(Planning).createQueryBuilder('planning');

        query.skip((listeplanning.page - 1) * listeplanning.limit);
        query.take(listeplanning.limit);

        const [planning, total] = await query.getManyAndCount();
        return {
            planning,
            total
        };
    }
    async CreatPlanning(planningData :PlanningRequest ):Promise<Planning | Error>{
        const newPlanningRepository  = this.db.getRepository(Planning);
        const userUsecase = new UseruseCase(AppDataSource);
        const newPlanning = new Planning();

        newPlanning.Id = planningData.Id;
        newPlanning.Description = planningData.Description;
        newPlanning.Date_Debut = planningData.Date_Debut;
        newPlanning.Date_Fin = planningData.Date_Fin;
        newPlanning.Id_User = planningData.Id_User;

        // on vérifie si l'utlisateur existe 
        const user = userUsecase.getUserById(newPlanning.Id_User)
        if(!user){
            throw new EntityNotFoundError(User, newPlanning.Id_User);
        }
        return newPlanningRepository.save(newPlanning);
    }

    async getPlanningById(id_planning: number): Promise<Planning> {
        const eventRepository  = this.db.getRepository(Planning);

        const planning = await eventRepository.findOne({
            where: { Id: id_planning }
        });
        if (!planning) {
            throw new EntityNotFoundError(Planning, id_planning);
        }
        return planning;
    }

    async DeletePlanning(id_planning : number): Promise<DeleteResult>{

        const userRepository  = this.db.getRepository(Planning);

        try {
            const result = await this.getPlanningById(id_planning);
            if(result == null){
                throw new Error(`${id_planning} not found`);
            }

            return await userRepository.delete(id_planning);
        } catch (error) {
            console.error("Failed to delete planning with ID:", id_planning, error);
            throw error;
        }

    }

    async upDatePlanningData(id_planning : number,info : any){
        try{
            const userRepository = this.db.getRepository(Planning)
            console.log("info",info)
            const result  = await this.getPlanningById(id_planning)
            console.log("result",result)

            if(result instanceof Planning){
                const planning = result;
                console.log("planning = result",planning)
                Object.assign(planning, info);
                console.log("id_planning",planning)
               await userRepository.save(planning) 
            }else {
                throw new Error('planning not found');
            }
        }catch(error){
            console.error("Failed to update planning with ID:", id_planning, error);
        }
    }
}