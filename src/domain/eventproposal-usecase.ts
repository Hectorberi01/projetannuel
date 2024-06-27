import {DataSource, DeleteResult, EntityNotFoundError} from "typeorm";
import {Event} from "../database/entities/event";
import {AppDataSource} from "../database/database";
import {ClubUseCase} from "./club-usecase";
import {FormationCenterUseCase} from "./formationcenter-usecase";
import {UseruseCase} from "./user-usecase";
import {EventProposal} from "../database/entities/eventProposal";
import {PlayerUseCase} from "./player-usercase";
import {CreateEventProposalRequest} from "../handlers/validator/eventproposal-validator";


export interface ListEventProposalRequest {
    limit: number;
    page: number;
}

export class EventProposalUseCase {
    constructor(private readonly db: DataSource) {
    }

    async getAllEventProposals(list: ListEventProposalRequest): Promise<{
        eventProposals: EventProposal[],
        total: number
    }> {
        const query = this.db.getRepository(EventProposal).createQueryBuilder('eventProposal')
            .leftJoinAndSelect('eventProposal.club', 'club')
            .leftJoinAndSelect('eventProposal.formationCenter', 'formationCenter')
            .leftJoinAndSelect('eventProposal.player', 'player')
            .skip((list.page - 1) * list.limit)
            .take(list.limit);

        console.log('Executing query:', query.getQuery());

        try {
            const [eventProposals, total] = await query.getManyAndCount();
            console.log('Query result:', eventProposals, total);
            return {
                eventProposals,
                total
            };
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    async createEventProposal(eventProposalData: CreateEventProposalRequest): Promise<EventProposal> {
        try {
            const repo = this.db.getRepository(EventProposal);
            const userUseCase = new UseruseCase(AppDataSource);
            const clubUseCase = new ClubUseCase(AppDataSource);
            const formationCenterUseCase = new FormationCenterUseCase(AppDataSource);
            const playerUseCase = new PlayerUseCase(AppDataSource);
            let club = null;
            let formationCenter = null;
            let eventProposal = new EventProposal();

            const createdBy = await userUseCase.getUserById(eventProposalData.createdById);
            const player = await playerUseCase.getPlayerById(eventProposalData.playerId);

            if (eventProposalData.clubId != null) {
                club = await clubUseCase.getClubById(eventProposalData.clubId);
            } else if (eventProposalData.formationCenterId) {
                formationCenter = await formationCenterUseCase.getFormationCenterById(eventProposalData.formationCenterId);
            }

            eventProposal.createdBy = createdBy;
            eventProposal.createdAt = new Date();
            eventProposal.title = eventProposalData.title;
            eventProposal.description = eventProposalData.description;
            eventProposal.startDate = eventProposalData.startDate;
            eventProposal.endDate = eventProposalData.endDate;
            eventProposal.place = eventProposalData.place;
            eventProposal.player = player;
            if (formationCenter != null) {
                eventProposal.formationCenter = formationCenter;
            }
            if (club != null) {
                eventProposal.club = club;
            }

            return await repo.save(eventProposal);
        } catch (error) {
            throw new Error("Impossible de créer cet proposition d'évenement");
        }
    }

    async getEventProposalById(eventProposalId: number): Promise<EventProposal> {
        try {
            const repo = this.db.getRepository(EventProposal);

            const eventProposal = await repo.findOne({
                where: {id: eventProposalId},
                relations: ['createdBy', 'club', 'formationCenter', 'player.user', 'player.user']
            });
            if (!eventProposal) {
                throw new EntityNotFoundError(Event, eventProposalId);
            }
            return eventProposal;
        } catch (error: any) {
            throw new EntityNotFoundError(Event, eventProposalId);
        }
    }

    async deleteEventProposal(eventProposalId: number): Promise<DeleteResult> {
        try {
            const repo = this.db.getRepository(EventProposal);
            const obj = await this.getEventProposalById(eventProposalId);

            if (!obj) {
                throw new EntityNotFoundError(Event, eventProposalId);
            }

            return await repo.delete(eventProposalId);
        } catch (error) {
            throw error;
        }

    }
}