import {DataSource, DeleteResult, EntityNotFoundError} from "typeorm";
import {Sport} from "../database/entities/sport";
import {FormationCenter} from "../database/entities/formationcenter";
import {Player} from "../database/entities/player";
import {CreateSportRequest} from "../handlers/validator/sport-validator";
import {Club} from "../database/entities/club";


export interface ListSportUseCase {
    limit: number;
    page: number;
}

export class SportUseCase {

    constructor(private readonly db: DataSource) {
    }

    async getAllSports(listesport: ListSportUseCase): Promise<{ sports: Sport[], total: number }> {
        const query = this.db.getRepository(Sport).createQueryBuilder('Sport');

        query.skip((listesport.page - 1) * listesport.limit);
        query.take(listesport.limit);

        const [sports, total] = await query.getManyAndCount();
        return {
            sports,
            total
        };
    }

    async createSport(sportData: CreateSportRequest): Promise<Sport | Error> {
        try {
            const sportRepository = this.db.getRepository(Sport);

            const newSport = new Sport();

            newSport.name = sportData.name;

            return sportRepository.save(newSport);
        } catch (error) {
            console.error("Failed to creat sport:");
            throw error;
        }

    }

    async getSportById(sportId: number): Promise<Sport> {
        try {
            const sportRepository = this.db.getRepository(Sport);

            const sport = await sportRepository.findOne({
                where: {id: sportId}
            });

            if (!sport) {
                throw new EntityNotFoundError(Sport, sport);
            }
            return sport;
        } catch (error) {
            console.error("Failed to sport with ID:", sportId, error);
            throw error;
        }
    }

    async deleteSport(sportId: number): Promise<DeleteResult> {

        const sportRepository = this.db.getRepository(Sport);
        const result = await this.getSportById(sportId);
        if (result == null) {
            throw new Error(`${sportId} not found`);
        }

        return await sportRepository.delete(sportId);
    }

    async updateSport(sportId: number, info: any) {
        try {
            const sportRepository = this.db.getRepository(Sport);
            console.log("info", info)
            const result = await this.getSportById(sportId)
            console.log("result", result)

            if (result instanceof Sport) {
                const sport = result;
                console.log("planning = result", sport)
                Object.assign(sport, info);
                console.log("id_planning", sport)
                await sportRepository.save(sport)
            } else {
                throw new Error('planning not found');
            }
        } catch (error) {
            console.error("Failed to update planning with ID:", sportId, error);
        }
    }

    async getAssociatedFormationsCenters(sportId: number): Promise<FormationCenter[]> {

        const formationCenterRepository = this.db.getRepository(FormationCenter);

        const sport = await this.getSportById(sportId);

        if (!sport) {
            throw new Error(`Sport ${sportId} was not found`);
        }

        return await formationCenterRepository.findBy({sports: sport});
    }

    async getAssociatedPlayers(sportId: number): Promise<Player[]> {

        const playerRepository = this.db.getRepository(Player);

        const sport = await this.getSportById(sportId);

        if (!sport) {
            throw new Error(`Sport ${sportId} was not found`);
        }

        return await playerRepository.findBy({sport: sport});
    }

    async getAssociatedClubs(sportId: number): Promise<Club[]> {

        const clubRepository = this.db.getRepository(Club);

        const sport = await this.getSportById(sportId);

        if (!sport) {
            throw new Error(`Sport ${sportId} was not found`);
        }

        return await clubRepository.findBy({sports: sport});
    }
}