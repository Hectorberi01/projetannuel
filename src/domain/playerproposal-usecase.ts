import {Player} from "../database/entities/player";
import {PlayerProposal} from "../database/entities/playerproposal";
import {FormationCenterUseCase} from "./formationcenter-usecase";
import {AppDataSource} from "../database/database";
import {SportUseCase} from "./sport-usecase";
import {CreatePlayerProposalRequest} from "../handlers/validator/playerproposal-validator";
import {CreatePlayerRequest} from "../handlers/validator/player-validator";
import {PlayerUseCase} from "./player-usercase";


export interface ListPlayerProposal {
    limit: number;
    page: number;
}

export class PlayerProposalUseCase {

    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    async getAllPlayerProposals(listplayer: ListPlayerProposal): Promise<{ playerProposals: PlayerProposal[], total: number }> {

        const query = this.db.getRepository(PlayerProposal).createQueryBuilder('playerProposal')
            .leftJoinAndSelect('playerProposal.formationCenter', 'formationCenter')
            .leftJoinAndSelect('playerProposal.sport', 'sport')
            .skip((listplayer.page - 1) * listplayer.limit)
            .take(listplayer.limit);

        const [playerProposals, total] = await query.getManyAndCount();
        return {
            playerProposals,
            total
        };
    }

    async createPlayerProposal(playerProposalData: CreatePlayerProposalRequest): Promise<PlayerProposal> {

        try {
            const repo = this.db.getRepository(PlayerProposal);
            const fcUseCase = new FormationCenterUseCase(AppDataSource);
            const fc = await fcUseCase.getFormationCenterById(playerProposalData.formationCenterId);
            const sportUseCase = new SportUseCase(AppDataSource);
            const sport = await sportUseCase.getSportById(playerProposalData.sportId)

            if (!sport || !fc) {
                throw new Error("Impossible de créer cette proposition de joueur");
            }
            let playerProposal = new PlayerProposal();
            playerProposal.firstName = playerProposalData.firstName;
            playerProposal.lastName = playerProposalData.lastName;
            playerProposal.birthDate = playerProposalData.birthDate;
            playerProposal.formationCenter = fc;
            playerProposal.sport = sport;
            playerProposal.email = playerProposalData.email;
            playerProposal.height = playerProposalData.height;
            playerProposal.weight = playerProposalData.weight;

            return await repo.save(playerProposal);
        } catch (error) {
            throw new Error("Impossible de créer cette proposition de joueur");
        }
    }

    async createPlayerWProposal(ppId: number): Promise<Player | Error> {
        try {
            const playerUseCase = new PlayerUseCase(AppDataSource);
            const pp = await this.getPlayerProposalById(ppId);

            let playerRequest: CreatePlayerRequest = {
                firstName: pp.firstName,
                lastName: pp.lastName,
                birthDate: pp.birthDate,
                formationCenterId: pp.formationCenter.id,
                sportId: pp.sport.id,
                email: pp.email,
                height: pp.height,
                weight: pp.weight,
                stats: ""
            }

            const result = await playerUseCase.createPlayer(playerRequest, undefined);
            if (!result) {
                throw new Error("Impossible de créer un joueur à partir de cette proposition");
            }
            return result;
        } catch (error) {
            throw new Error("Impossible de créer un joueur à partir de cette proposition");
        }
    }

    async getPlayerProposalById(id: number): Promise<PlayerProposal> {
        try {
            const repo = this.db.getRepository(PlayerProposal);
            const pp = await repo.findOne({
                where: {id: id},
                relations: {
                    formationCenter: true,
                    sport: true,
                }
            })

            if (!pp) {
                throw new Error("Player proposal inconnu");
            }

            return pp;
        } catch (error) {
            throw new Error("Player proposal inconnu");
        }
    }

    async deletePlayerProposal(id: number): Promise<void> {
        try {
            const repo = this.db.getRepository(PlayerProposal);
            await repo.deleteOne({where: {id: id}});
        } catch (error) {
            throw new Error("Impossible de supprimer cette proposition");
        }
    }

}