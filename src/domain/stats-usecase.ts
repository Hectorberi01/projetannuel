import {DataSource} from "typeorm";
import {Stats} from "../database/entities/stats";
import {User} from "../database/entities/user";
import {Club} from "../database/entities/club";
import {FormationCenter} from "../database/entities/formationcenter";
import {Player} from "../database/entities/player";

export class StatsUseCase {

    constructor(private readonly db: DataSource) {
    }

    async getStats(): Promise<Stats> {
        const userRepository = this.db.getRepository(User);
        const clubRepository = this.db.getRepository(Club);
        const formationCenterRepository = this.db.getRepository(FormationCenter);
        const playerRepository = this.db.getRepository(Player);

        const totalUsers = await userRepository.count();
        const totalClubs = await clubRepository.count();
        const totalFormationCenters = await formationCenterRepository.count();
        const totalPlayers = await playerRepository.count();

        return {
            totalUsers,
            totalClubs,
            totalFormationCenters,
            totalPlayers
        };
    }
}