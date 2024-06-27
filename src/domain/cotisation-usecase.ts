import {DataSource} from "typeorm";
import {Cotisation} from "../database/entities/cotisation";
import {EntityType} from "../Enumerators/EntityType";
import {CotisationStatus} from "../Enumerators/CotisationStatus";
import {UseruseCase} from "./user-usecase";
import {AppDataSource} from "../database/database";
import {ClubUseCase} from "./club-usecase";
import {FormationCenterUseCase} from "./formationcenter-usecase";
import {MessageUseCase} from "./message-usecase";
import {MessageType} from "../Enumerators/MessageType";
import {User} from "../database/entities/user";

export interface ListCotisationRequest {
    limit: number;
    page: number;
}

export class CotisationUseCase {

    constructor(private readonly db: DataSource) {
    }

    async createCotisation(entityType: EntityType, entityId: number): Promise<Cotisation> {

        try {
            const repo = this.db.getRepository(Cotisation);
            const messageUseCase = new MessageUseCase(AppDataSource);
            const userUseCase = new UseruseCase(AppDataSource);
            let cotisation = new Cotisation();
            cotisation.status = CotisationStatus.UNPAID;
            const today = new Date();
            today.setDate(today.getDate() + 7);
            cotisation.limitDate = today;
            cotisation.entityType = entityType;
            let user: User;

            if (entityType === EntityType.USER) {
                const userEntity = await userUseCase.getUserById(entityId);
                if (!userEntity) {
                    throw new Error();
                }
                cotisation.user = userEntity;
                cotisation.amount = 1;
                user = userEntity;
            } else if (entityType === EntityType.CLUB) {
                const useCase = new ClubUseCase(AppDataSource);
                const club = await useCase.getClubById(entityId);
                if (!club) {
                    throw new Error();
                }
                cotisation.club = club;
                cotisation.amount = 10;
                const potentialDir = await userUseCase.getUserByEmail(club.email);
                if (!potentialDir) {
                    throw new Error("Directeur non trouvé");
                }
                user = potentialDir;
            } else if (entityType === EntityType.FORMATIONCENTER) {
                const useCase = new FormationCenterUseCase(AppDataSource);
                const formationCenter = await useCase.getFormationCenterById(entityId);
                if (!formationCenter) {
                    throw new Error();
                }
                cotisation.formationCenter = formationCenter;
                cotisation.amount = 10;
                const potentialDir = await userUseCase.getUserByEmail(formationCenter.email);
                if (!potentialDir) {
                    throw new Error("Directeur non trouvé");
                }
                user = potentialDir;
            } else {
                throw new Error("Type d'entité non implémenté");
            }

            const result = await repo.save(cotisation);

            if (!result) {
                throw new Error("Erreur lors de la création de la cotisation")
            }

            await messageUseCase.sendMessage(MessageType.CREATE_COTISATION, user, cotisation);
            return result;
        } catch (error: any) {
            throw new Error("Erreur lors de la création de la cotisation")
        }
    }

    async getAllCotisations(list: ListCotisationRequest): Promise<{ cotisations: Cotisation[], total: number }> {

        const query = this.db.getRepository(Cotisation).createQueryBuilder('cotisation')
            .leftJoinAndSelect('cotisation.transaction', 'formationCenter')
            .skip((list.page - 1) * list.limit)
            .take(list.limit);

        const [cotisations, total] = await query.getManyAndCount();
        return {
            cotisations,
            total
        };
    }

    async getCotisationById(id: number): Promise<Cotisation> {
        try {
            const repo = this.db.getRepository(Cotisation);
            const cotisation = await repo.findOne({where: {id: id}});
            if (!cotisation) {
                throw new Error("utilisateur inconnu");
            }
            return cotisation;
        } catch (error) {
            throw new Error("Erreur lors de la récupération de la cotisation")
        }
    }

    async verifyUnpaidCotisation(): Promise<Cotisation[]> {
        try {
            const repo = this.db.getRepository(Cotisation);
            const cotisations = await repo.find({
                where: {status: CotisationStatus.UNPAID},
                relations: {
                    user: true
                }
            })

            for (const cotisation of cotisations) {
                await this.manageUnpaidCotisation(cotisation);
            }

            return cotisations
        } catch (error: any) {
            throw new Error("Erreur lors de la récupération des cotisations non payées")
        }
    }

    async manageUnpaidCotisation(cotisation: Cotisation): Promise<void> {
        try {
            if (!cotisation) {
                throw new Error("Cotisation incorrecte");
            }
            const repo = this.db.getRepository(Cotisation);
            const msgUseCase = new MessageUseCase(AppDataSource);
            const userUseCase = new UseruseCase(AppDataSource);
            if (cotisation.limitDate < new Date()) {
                const result = await repo.delete(cotisation);
                if (!result) {
                    throw new Error("Suppression de la cotisation impossible");
                }
                await userUseCase.deactivateUserById(cotisation.user.id);
                await msgUseCase.sendMessage(MessageType.DELETE_COTISATION, cotisation.user, cotisation);
            } else if (cotisation.limitDate > new Date()) {
                await msgUseCase.sendMessage(MessageType.REMINDER_COTISATION, cotisation.user, cotisation);
            }
        } catch (error) {
            throw new Error("Impossible de gérer cette cotisation");
        }
    }

    async getCotisationFromUser(userId: number): Promise<Cotisation> {
        try {
            const repo = this.db.getRepository(Cotisation);
            const userUseCase = new UseruseCase(AppDataSource);
            const user = await userUseCase.getUserById(userId);
            if (!user) {
                throw new Error("Utilisateur inconnu");
            }

            const cotisation = await repo.findOne({
                where: {user: user},
            })
            if (!cotisation) {
                throw new Error("Erreur lors de la récupération");
            }
            return cotisation;
        } catch (error: any) {
            throw new Error("Erreur lors de la récupération");
        }
    }
}