import { DataSource, DeleteResult, EntityNotFoundError } from "typeorm";
import { Sport } from "../database/entities/sport";
import { SportRequest } from "../handlers/validator/sport-validator";


export interface ListSportUseCase {
    limit: number;
    page: number;
}

export class SportUseCase{

    constructor(private readonly db: DataSource){}

    async ListeSport(listesport: ListSportUseCase): Promise<{ sport: Sport[], total: number }> {
        const query = this.db.getRepository(Sport).createQueryBuilder('Sport');

        query.skip((listesport.page - 1) * listesport.limit);
        query.take(listesport.limit);

        const [sport, total] = await query.getManyAndCount();
        return {
            sport,
            total
        };
    }

    async CreatSport(sportData :SportRequest ):Promise<Sport | Error>{
        try{
            const sportRepository  = this.db.getRepository(Sport);
    
            const newSport = new Sport();
    
            newSport.Id = sportData.Id;
            newSport.Name = sportData.Name;
    
            return sportRepository.save(newSport);
        }catch(error){
            console.error("Failed to creat sport:");
            throw error;
        }
        
    }

    async getSportById(id_sport: number): Promise<Sport> {
        try{
            const sportRepository  = this.db.getRepository(Sport);

            const sport = await sportRepository.findOne({
                where: { Id: id_sport }
            });

            if (!sport) {
                throw new EntityNotFoundError(Sport, id_sport);
            }
            return sport;
        }catch(error){
            console.error("Failed to sport with ID:",id_sport, error);
            throw error;
        }
    }

    async DeleteSport(id_sport : number): Promise<DeleteResult>{

        const sportRepository  = this.db.getRepository(Sport);

        try {
            const result = await this.getSportById(id_sport);
            if(result == null){
                throw new Error(`${id_sport} not found`);
            }

            return await sportRepository.delete(id_sport);
        } catch (error) {
            console.error("Failed to delete planning with ID:", id_sport, error);
            throw error;
        }
    }

    async upDateSportData(id_sport : number,info : any){
        try{
            const sportRepository  = this.db.getRepository(Sport);
            console.log("info",info)
            const result  = await this.getSportById(id_sport)
            console.log("result",result)

            if(result instanceof Sport){
                const sport = result;
                console.log("planning = result",sport)
                Object.assign(sport, info);
                console.log("id_planning",sport)
               await sportRepository.save(sport) 
            }else {
                throw new Error('planning not found');
            }
        }catch(error){
            console.error("Failed to update planning with ID:", id_sport, error);
        }
    }
}