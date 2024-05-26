import { DataSource, DeleteResult, EntityNotFoundError } from "typeorm";
import { Player } from "../database/entities/player";
import { PlayerRequest } from "../handlers/validator/player-validator";
import { Image } from "../database/entities/image";

export interface ListPlayerCase {
    limit: number;
    page: number;
}


export class PlayerUseCase{

    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    async listPlayer(listplayer: ListPlayerCase): Promise<{ player: Player[], total: number }> {

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
            where: { Id: playerid },
            relations: ['FormationCenter', 'Sport', 'Image'] 
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

    async upDatePlayerData(playerId : number,info : any){

        const playerRepository = this.db.getRepository(Player);
        const imageRepository = this.db.getRepository(Image);
        try{
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
                const player = await playerRepository.findOne({
                    where: { Id: playerId },
                    relations: ['FormationCenter', 'Sport', 'Image'],
                });
    
                if (!player) {
                    throw new EntityNotFoundError(Player, playerId);
                }
    
                Object.assign(player, info);
    
                if (image) {
                    player.Image = image;
                    image.players = player;
                    await queryRunner.manager.save(image);
                }
    
                await queryRunner.manager.save(player);
                await queryRunner.commitTransaction();
            }catch(error){
                await queryRunner.rollbackTransaction();
                console.error("Failed to update player with ID:", playerId, error);
                throw error;
            }finally{
                await queryRunner.release();
            }
        }catch(error){
            console.error("Failed to save image or update player with ID:", playerId, error);
            throw error
        }
    }
}