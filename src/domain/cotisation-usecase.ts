import {DataSource, Repository} from "typeorm";
import {Cotisation} from "../database/entities/cotisation";
import {EntityType} from "../Enumerators/EntityType";
import {CotisationStatus} from "../Enumerators/CotisationStatus";
import {UseruseCase} from "./user-usecase";
import {ClubUseCase} from "./club-usecase";
import {FormationCenterUseCase} from "./formationcenter-usecase";
import {MessageUseCase} from "./message-usecase";
import {MessageType} from "../Enumerators/MessageType";
import {User} from "../database/entities/user";
import {AppDataSource} from "../database/database";
import {InfoUseCase} from "./info-usecase";
import {CreateInfoRequest} from "../handlers/validator/info-validator";
import {InfoType} from "../Enumerators/InfoType";
import {InfoLevel} from "../Enumerators/InfoLevel";

export interface ListCotisationRequest {
    limit: number;
    page: number;
}

export class CotisationUseCase {

    private cotisationRepository: Repository<Cotisation>;

    constructor(private readonly db: DataSource) {
        this.cotisationRepository = this.db.getRepository(Cotisation);
    }

    async createCotisation(entityType: EntityType, entityId: number): Promise<Cotisation> {
        try {
            let cotisation = new Cotisation();
            cotisation.status = CotisationStatus.UNPAID;
            const today = new Date();
            today.setDate(today.getDate() + 7);
            cotisation.limitDate = today;
            cotisation.entityType = entityType;
            let user: User;

            const userUseCase = new UseruseCase(this.db);

            if (entityType === EntityType.USER) {
                const userEntity = await userUseCase.getUserById(entityId);
                if (!userEntity) {
                    throw new Error("Utilisateur inconnu");
                }
                cotisation.user = userEntity;
                cotisation.amount = 1;
                user = userEntity;
            } else if (entityType === EntityType.CLUB) {
                const clubUseCase = new ClubUseCase(this.db);
                const club = await clubUseCase.getClubById(entityId);
                if (!club) {
                    throw new Error("Club inconnu");
                }
                cotisation.club = club;
                cotisation.amount = 10;
                const potentialDir = await userUseCase.getUserByEmail(club.email);
                if (!potentialDir) {
                    throw new Error("Directeur non trouvé");
                }
                user = potentialDir;
            } else if (entityType === EntityType.FORMATIONCENTER) {
                const formationCenterUseCase = new FormationCenterUseCase(this.db);
                const formationCenter = await formationCenterUseCase.getFormationCenterById(entityId);
                if (!formationCenter) {
                    throw new Error("Centre de formation inconnu");
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

            const result = await this.cotisationRepository.save(cotisation);

            if (!result) {
                throw new Error("Erreur lors de la création de la cotisation");
            }

            const messageUseCase = new MessageUseCase(this.db);
            await messageUseCase.sendMessage(MessageType.CREATE_COTISATION, user, cotisation);
            return result;
        } catch (error: any) {
            throw new Error("Erreur lors de la création de la cotisation: " + error.message);
        }
    }

    async getAllCotisations(list: ListCotisationRequest): Promise<{ cotisations: Cotisation[], total: number }> {
        const query = this.cotisationRepository.createQueryBuilder('cotisation')
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
            const cotisation = await this.cotisationRepository.findOne({
                where: {id: id},
                relations: {
                    user: true
                }
            });
            if (!cotisation) {
                throw new Error("Cotisation inconnue");
            }
            return cotisation;
        } catch (error: any) {
            throw new Error("Erreur lors de la récupération de la cotisation: " + error.message);
        }
    }

    async verifyUnpaidCotisation(): Promise<Cotisation[]> {
        try {
            const cotisations = await this.cotisationRepository.find({
                where: {
                    status: CotisationStatus.UNPAID,
                    entityType: EntityType.USER
                },
                relations: {
                    user: true
                }
            });

            for (const cotisation of cotisations) {
                await this.manageUnpaidCotisation(cotisation);
            }

            return cotisations;
        } catch (error: any) {
            throw new Error("Erreur lors de la récupération des cotisations non payées: " + error.message);
        }
    }

    async manageUnpaidCotisation(cotisation: Cotisation): Promise<void> {
        try {
            if (!cotisation || cotisation.user.deleted) {
                throw new Error("Cotisation incorrecte ou utilisateur supprimé");
            }

            const userUseCase = new UseruseCase(AppDataSource);
            const messageUseCase = new MessageUseCase(AppDataSource);

            if (cotisation.limitDate < new Date()) {
                await userUseCase.deactivateUserById(cotisation.user.id);
                await messageUseCase.sendMessage(MessageType.DELETE_COTISATION, cotisation.user, cotisation);
            } else if (cotisation.limitDate > new Date()) {
                await messageUseCase.sendMessage(MessageType.REMINDER_COTISATION, cotisation.user, cotisation);
            }
        } catch (error: any) {
            throw new Error("Impossible de gérer cette cotisation: " + error.message);
        }
    }

    async getCotisationFromEntity(entityType: EntityType, entityId: number): Promise<Cotisation | null> {
        try {
            const userUseCase = new UseruseCase(this.db);

            if (entityType === EntityType.USER) {
                const cotisation = await this.cotisationRepository.createQueryBuilder("cotisation")
                    .leftJoinAndSelect("cotisation.user", "user")
                    .where("user.id = :id", {id: entityId})
                    .getOne();

                if (!cotisation) {
                    throw new Error("Pas de cotisation");
                }

                console.log('Cotisation found:', cotisation);
                return cotisation;
            } else if (entityType === EntityType.CLUB) {
                const clubUseCase = new ClubUseCase(this.db);
                const club = await clubUseCase.getClubById(entityId);
                if (!club) {
                    throw new Error("Club inconnu");
                }

                const result = await this.cotisationRepository.findOne({
                    where: {club: club},
                });

                if (!result) {
                    throw new Error("Pas de cotisation");
                }
                return result;
            } else if (entityType === EntityType.FORMATIONCENTER) {
                const formationCenterUseCase = new FormationCenterUseCase(this.db);
                const fc = await formationCenterUseCase.getFormationCenterById(entityId);
                if (!fc) {
                    throw new Error("Centre de formation inconnu");
                }

                const result = await this.cotisationRepository.findOne({
                    where: {formationCenter: fc},
                });

                if (!result) {
                    throw new Error("Pas de cotisation");
                }
                return result;
            }
            return null;
        } catch (error: any) {
            throw new Error("Impossible de trouver la cotisation: " + error.message);
        }
    }

    async updateCotisationStatus(cotisationId: number, status: CotisationStatus): Promise<Cotisation> {
        try {
            const messageUseCase = new MessageUseCase(AppDataSource);
            const infoUseCase = new InfoUseCase(AppDataSource);
            const cotisation = await this.getCotisationById(cotisationId);

            if (!cotisation) {
                throw new Error("Cotisation inconnu");
            }

            cotisation.status = status;
            cotisation.paymentDate = new Date();
            const result = await this.cotisationRepository.save(cotisation);
            let infoRequest: CreateInfoRequest = {
                type: InfoType.COTISATION_PAYMENT,
                level: InfoLevel.LOW,
                text: `Utilisateur ${cotisation.user.firstname} ${cotisation.user.lastname} [${cotisation.user.id}] a payé sa cotisation`,
                user: cotisation.user,
            }
            await infoUseCase.createInfo(infoRequest);
            await messageUseCase.sendMessage(MessageType.PAYMENT_COTISATION, cotisation.user)
            return result;
        } catch (error: any) {
            throw new Error("Maj impossible de la cotisation: " + error.message);
        }
    }

    async updateCotisationStatusWithoutLogs(cotisationId: number, status: CotisationStatus): Promise<Cotisation> {
        try {
            const cotisation = await this.getCotisationById(cotisationId);

            if (!cotisation) {
                throw new Error("Cotisation inconnu");
            }

            cotisation.status = status;
            cotisation.paymentDate = new Date();
            return await this.cotisationRepository.save(cotisation);
        } catch (error: any) {
            throw new Error("Maj impossible de la cotisation: " + error.message);
        }
    }

    async getUsersWithCotisationPaidYesterday(): Promise<User[]> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0)
            const yesterday = new Date();
            yesterday.setHours(0, 0, 0, 0);
            yesterday.setDate(yesterday.getDate() - 1);

            const cotisations = await this.cotisationRepository.createQueryBuilder("cotisation")
                .leftJoinAndSelect("cotisation.user", "user")
                .where("user.deleted = false")
                .where("cotisation.status = :status", {status: CotisationStatus.PAID})
                .andWhere("cotisation.entity_type = :entityType", {entityType: EntityType.USER})
                .andWhere("cotisation.payment_date >= :yesterday", {yesterday: yesterday})
                .andWhere("cotisation.payment_date <= :today", {today: today})
                .andWhere("cotisation.generated = false")
                .getMany();

            const users: User[] = [];
            if (cotisations.length === 0) {
                return users;
            }
            cotisations.forEach(c => users.push(c.user));
            return users;
        } catch (error: any) {
            throw new Error("Impossible de trouver les users: " + error.message);
        }
    }

    async updateCotisation(cotisationId: number, cotisationData: Cotisation): Promise<any> {
        try {
            let cotisation = await this.getCotisationById(cotisationId);
            cotisation.generated = cotisationData.generated;
            cotisation.status = cotisationData.status;
            await this.cotisationRepository.update(cotisationId, cotisation);
        } catch (error: any) {
            throw new Error("Impossible de mettre à jour cette cotisation")
        }

    }

}
