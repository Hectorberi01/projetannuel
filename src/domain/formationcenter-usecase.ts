import {DataSource, DeleteResult, EntityNotFoundError} from "typeorm";
import {FormationCenterRequest} from "../handlers/validator/formation-validator";
import {FormationCenter} from "../database/entities/formationcenter"
import {Player} from "../database/entities/player";
import {Role} from "../Enumerators/Role";
import {UseruseCase} from "./user-usecase";
import {AppDataSource} from "../database/database";
import {CotisationUseCase} from "./cotisation-usecase";
import {EntityType} from "../Enumerators/EntityType";

export interface ListFormationCenterCase {
    limit: number;
    page: number;
}

export class FormationCenterUseCase {

    constructor(private readonly db: DataSource) {
    }

    async getAllFormationsCenters(listformation: ListFormationCenterCase): Promise<{
        formationsCenters: FormationCenter[],
        total: number
    }> {
        const query = this.db.getRepository(FormationCenter).createQueryBuilder('FormationCenter')
            .leftJoinAndSelect('FormationCenter.sports', 'sport');


        query.skip((listformation.page - 1) * listformation.limit);
        query.take(listformation.limit);

        const [formationsCenters, total] = await query.getManyAndCount();
        return {
            formationsCenters,
            total
        };
    }

    async createFormationCenter(formationData: FormationCenterRequest): Promise<FormationCenter | Error> {
        try {
            const cotisationUseCase = new CotisationUseCase(AppDataSource);
            const formationRepository = this.db.getRepository(FormationCenter);
            const newFormation = new FormationCenter();
            const userUseCase = new UseruseCase(AppDataSource);

            newFormation.name = formationData.name;
            newFormation.address = formationData.address;
            newFormation.sports = formationData.sports;
            newFormation.email = formationData.email;
            newFormation.createDate = new Date();

            const result = await formationRepository.save(newFormation);

            if (!result) {
                throw new Error("Erreur lors de la création du centre de formation")
            }

            await userUseCase.createEntityUser(newFormation, Role.ADMIN_FORMATIONCENTER);
            await cotisationUseCase.createCotisation(EntityType.FORMATIONCENTER, result.id)
            return result;

        } catch (error) {
            console.error("Failed to creat club account :", error);
            throw error;
        }

    }

    async getFormationCenterById(id_formation: number): Promise<FormationCenter> {
        const formationRepository = this.db.getRepository(FormationCenter);

        const fc = await formationRepository.findOne({
            where: {id: id_formation},
            relations: ['sports', 'users']
        });
        if (!fc) {
            throw new EntityNotFoundError(FormationCenter, id_formation);
        }
        return fc;
    }

    async deleteFormationCenter(id_formation: number): Promise<DeleteResult> {

        const formationRepository = this.db.getRepository(FormationCenter);

        try {
            const result = await this.getFormationCenterById(id_formation);
            if (result == null) {
                throw new Error(`${id_formation} not found`);
            }

            return await formationRepository.delete(id_formation);
        } catch (error) {
            console.error("Failed to delete formation center with ID:", id_formation, error);
            throw error;
        }

    }

    async updateFormationCenter(id_formation: number, info: any) {
        try {
            const ClubRepository = this.db.getRepository(FormationCenter)
            console.log("info", info)
            const result = await this.getFormationCenterById(id_formation)
            console.log("result", result)

            if (result instanceof FormationCenter) {
                const club = result;
                console.log("planning = result", club)
                Object.assign(club, info);
                console.log("id_planning", club)
                await ClubRepository.save(club)
            } else {
                throw new Error('planning not found');
            }
        } catch (error) {
            console.error("Failed to update formation center with ID:", id_formation, error);
        }
    }

    async getAssociatedPlayers(formationCenterId: number): Promise<Player[]> {

        const playerRepository = this.db.getRepository(Player);
        const formationCenter = await this.getFormationCenterById(formationCenterId);

        if (!formationCenter) {
            throw new Error(`Sport ${formationCenterId} was not found`);
        }

        return playerRepository.findBy({formationCenter: formationCenter});
    }
}