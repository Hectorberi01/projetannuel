import {DeleteResult, EntityNotFoundError} from "typeorm";
import {Player} from "../database/entities/player";
import {CreatePlayerRequest, UpdatePlayerRequest} from "../handlers/validator/player-validator";
import {SportUseCase} from "./sport-usecase";
import {AppDataSource} from "../database/database";
import {FormationCenterUseCase} from "./formationcenter-usecase";
import {ImageUseCase} from "./image-usecase";
import {Role} from "../Enumerators/Role";
import {UseruseCase} from "./user-usecase";

export interface ListPlayerCase {
    limit: number;
    page: number;
}

export class PlayerUseCase {

    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    async getAllPlayers(listplayer: ListPlayerCase): Promise<{ players: Player[], total: number }> {

        const query = this.db.getRepository(Player).createQueryBuilder('player')
            .leftJoinAndSelect('player.formationCenter', 'formationCenter')
            .leftJoinAndSelect('player.sport', 'sport')
            .skip((listplayer.page - 1) * listplayer.limit)
            .take(listplayer.limit);

        const [players, total] = await query.getManyAndCount();
        return {
            players,
            total
        };
    }

    async createPlayer(playerData: CreatePlayerRequest, file: Express.Multer.File | undefined): Promise<Player | Error> {

        try {
            const sportUseCase = new SportUseCase(AppDataSource);
            const imageUseCase = new ImageUseCase(AppDataSource);
            const formationCenterUseCase = new FormationCenterUseCase(AppDataSource);
            const playerRepository = this.db.getRepository(Player);
            const userUseCase = new UseruseCase(AppDataSource);

            const newPlayer = new Player();

            newPlayer.firstName = playerData.firstName;
            newPlayer.lastName = playerData.lastName;
            newPlayer.birthDate = playerData.birthDate;
            if (playerData.height) newPlayer.height = playerData.height;
            if (playerData.weight) newPlayer.weight = playerData.weight;
            if (playerData.sportId) {
                const sport = await sportUseCase.getSportById(playerData.sportId);
                if (sport) {
                    newPlayer.sport = sport;
                }
            }

            if (playerData.formationCenterId) {
                const formationCenter = await formationCenterUseCase.getFormationCenterById(playerData.formationCenterId);
                if (formationCenter) {
                    newPlayer.formationCenter = formationCenter;
                }
            }

            if (playerData.stats) newPlayer.stats = playerData.stats;

            if (file != null) {
                const uploadedImage = await imageUseCase.createImage(file);
                if (uploadedImage) {
                    // @ts-ignore
                    newPlayer.image = uploadedImage
                }
            }

            const result = await playerRepository.save(newPlayer);

            if (!result) {
                throw new Error("Erreur lors de la création du joueur");
            }

            await userUseCase.createEntityUser(newPlayer, Role.PLAYER);
            return result;
        } catch (error) {
            console.error("Failed to create player  with ID:", error);
            throw error;
        }

    }

    async getPlayerById(playerId: number): Promise<Player> {
        const playerRepository = this.db.getRepository(Player);

        const player = await playerRepository.findOne({
            where: {id: playerId},
            relations: ['formationCenter', 'sport']
        });
        if (!player) {
            throw new EntityNotFoundError(Player, playerId);
        }
        return player;
    }

    async deletePlayer(playerId: number): Promise<DeleteResult> {

        const playerRepository = this.db.getRepository(Player);

        const result = await this.getPlayerById(playerId);
        if (result == null) {
            throw new Error(`${playerId} not found`);
        }
        return await playerRepository.delete(playerId);

    }

    async updatePlayerData(playerId: number, playerData: UpdatePlayerRequest) {

        const playerRepository = this.db.getRepository(Player);
        const formationCenterUseCase = new FormationCenterUseCase(AppDataSource);
        const sportUseCase = new SportUseCase(AppDataSource);
        const player = await this.getPlayerById(playerId);

        if (!player) {
            throw new Error(`${playerId} not found`);
        }

        if (player.id != playerData.id) {
            throw new Error('objet à modifier n\' pas le meme');
        }

        if (playerData.firstName && playerData.firstName != player.firstName) {
            player.firstName = playerData.firstName;
        }
        if (playerData.lastName && playerData.lastName != player.lastName) {
            player.lastName = playerData.lastName;
        }
        if (playerData.birthDate && playerData.birthDate != player.birthDate) {
            player.birthDate = playerData.birthDate;
        }
        if (playerData.height && playerData.height != player.height) {
            player.height = playerData.height;
        }
        if (playerData.weight && playerData.weight != player.weight) {
            player.weight = playerData.weight;
        }
        if (playerData.stats && player.stats != playerData.stats) {
            player.stats = playerData.stats;
        }
        if (playerData.formationCenterId && player.formationCenter.id != playerData.formationCenterId) {
            const formationCenter = await formationCenterUseCase.getFormationCenterById(playerData.formationCenterId);
            if (!formationCenter) {
                throw new Error(`Formation Center ${playerData.formationCenterId} not found`);
            }
            player.formationCenter = formationCenter;
        }
        if (playerData.sportId && player.sport.id != playerData.sportId) {
            const sport = await sportUseCase.getSportById(playerData.sportId);
            if (!sport) {
                throw new Error(`Sport ${playerData.sportId} not found`);
            }
            player.sport = sport;
        }

        await playerRepository.update(playerId, player);
    }
}