import {DataSource, DeleteResult, EntityNotFoundError, Repository} from "typeorm";
import {FormationCenterRequest} from "../handlers/validator/formation-validator";
import {FormationCenter} from "../database/entities/formationcenter"
import {Player} from "../database/entities/player";
import {Role} from "../Enumerators/Role";
import {UseruseCase} from "./user-usecase";
import {AppDataSource} from "../database/database";
import {CotisationUseCase} from "./cotisation-usecase";
import {EntityType} from "../Enumerators/EntityType";
import {User} from "../database/entities/user";
import {ImageUseCase} from "./image-usecase";

export interface ListFormationCenterCase {
    limit: number;
    page: number;
}

export class FormationCenterUseCase {

    private fcRepo: Repository<FormationCenter>;

    constructor(private readonly db: DataSource) {
        this.fcRepo = this.db.getRepository(FormationCenter)
    }

    private getUserUseCase() {
        const {UseruseCase} = require("./user-usecase");
        return new UseruseCase(this.db);
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
            relations: ['sports', 'users', 'image']
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
            throw new Error(`Formation center ${formationCenterId} was not found`);
        }

        return playerRepository.find({
            where: {formationCenter: formationCenter},
            relations: ["sport", "image"]
        });
    }

    async getAllFormationsCentersUsers(clubId: number): Promise<User[]> {
        const fc = await this.getFormationCenterById(clubId);
        if (!fc) {
            throw new Error(`${clubId} not found`);
        }
        const userUseCase = this.getUserUseCase();
        return await userUseCase.getAllFCUsers(fc);
    }

    async modifyFormationCenterPicture(formationCenterId: number, file: Express.Multer.File): Promise<void> {
        try {
            const imageUseCase = new ImageUseCase(AppDataSource);
            let fc = await this.getFormationCenterById(formationCenterId);
            if (!fc) {
                throw new Error("Centre de formation inconnu");
            }

            if (fc.image) {
                await imageUseCase.deleteImage(fc.image.id);
            }

            const image = await imageUseCase.createImage(file);

            if (!image || image == null) {
                throw new Error("Image impossible a uploader");
            }
            // @ts-ignore
            fc.image = image;
            await this.fcRepo.save(fc);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getAllUserIdsByFC(fcId: number): Promise<number[]> {
        const userRepository = this.db.getRepository(User);

        const users = await userRepository.createQueryBuilder('user')
            .select('user.id')
            .where('user.formationCenter.id = :clubId', {fcId})
            .getMany();

        return users.map(user => user.id);
    }
}