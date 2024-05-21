import { DataSource, DeleteResult, EntityNotFoundError } from "typeorm";
import { Player } from "../database/entities/player";
import { PlayerRequest } from "../handlers/validator/player-validator";

export interface ListPlayerCase {
    limit: number;
    page: number;
}


export class PlayerUseCase{

    constructor(private readonly db: DataSource){}

    async listPlayer(listplayer: ListPlayerCase): Promise<{ player: Player[], total: number }> {

        //const query = this.db.getRepository(Player).createQueryBuilder('player');
        const query = this.db.getRepository(Player).createQueryBuilder('player')
        .leftJoinAndSelect('player.FormationCenter', 'formationCenter') 
        .leftJoinAndSelect('player.Sport', 'sport') 
        .leftJoinAndSelect('player.Image', 'image') 
        .skip((listplayer.page - 1) * listplayer.limit)
        .take(listplayer.limit);

        const [player, total] = await query.getManyAndCount();
        return {
            player,
            total
        };
    }

    async createPlayer(playerData: PlayerRequest): Promise<Player | Error> {

        try{
            const playerRepository  = this.db.getRepository(Player);
            const newPlayer = new Player();
            newPlayer.FirstName = playerData.FirstName,
            newPlayer.Lastname = playerData.LastName,
            newPlayer.BirthDate = playerData.BirthDate,
            newPlayer.Height = playerData.Height,
            newPlayer.Weight = playerData.Weight,
            newPlayer.Image = playerData.Image,
            newPlayer.Sport = playerData.Sport,
            newPlayer.stats = playerData.stats,
            newPlayer.FormationCenter = playerData.FormationCenter

            return await playerRepository.save(newPlayer)
          
        }catch(error){
            console.error("Failed to create player  with ID:", error);
            throw error;
        }
        
    }

    async getPlayerById(playerid: number): Promise<Player> {
        const playerRepository  = this.db.getRepository(Player);

        const player = await playerRepository.findOne({
            where: { Id: playerid }
        });
        if (!player) {
            throw new EntityNotFoundError(Player, playerid);
        }
        return player;
    }

    
   
    // Pour la suppression
    async DeletePlayer(playerid : number): Promise<DeleteResult>{

        const playerRepository  = this.db.getRepository(Player);

        try {
            const result = await this.getPlayerById(playerid);
            if(result == null){
                throw new Error(`${playerid} not found`);
            }
            if (result instanceof Player) {
                //const player = result;
                return await playerRepository.delete(playerid);
            } else {
                throw new Error(` not found`);
            }
            
        } catch (error) {
            console.error("Failed to delete user with ID:", playerid, error);
            throw error;
        }

    }

    async upDatePlayerData(playerid : number,info : any){
        try{
            const playerRepository = this.db.getRepository(Player)
            const result  = await this.getPlayerById(playerid)
            if(result instanceof Player){
                const player = result;
              
                Object.assign(player, info);
            
               await playerRepository.save(player) 
            }else {
                throw new Error('player not found');
            }
        }catch(error){
            console.error("Failed to update player with ID:", playerid, error);
        }
    }
}