import {DataSource} from "typeorm";
import {Info} from "../database/entities/info";
import {CreateInfoRequest} from "../handlers/validator/info-validator";

export interface ListInfosRequest {
    limit: number;
    page: number;
    userId?: number;
    level?: string;
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
}


export class InfoUseCase {
    constructor(private readonly db: DataSource) {
    }

    async getAllInfos(list: ListInfosRequest): Promise<{ infos: Info[], total: number }> {
        const repo = this.db.getRepository(Info);
        const queryBuilder = repo.createQueryBuilder('info')
            .leftJoinAndSelect('info.user', 'user')
            .orderBy('info.date', 'DESC')
            .skip((list.page - 1) * list.limit)
            .take(list.limit);

        if (list.userId) {
            queryBuilder.andWhere('user.id = :userId', { userId: list.userId });
        }

        if (list.level) {
            queryBuilder.andWhere('info.level = :level', { level: list.level });
        }

        if (list.type) {
            queryBuilder.andWhere('info.type = :type', { type: list.type });
        }

        if (list.dateFrom) {
            queryBuilder.andWhere('info.date >= :dateFrom', { dateFrom: list.dateFrom });
        }

        if (list.dateTo) {
            queryBuilder.andWhere('info.date <= :dateTo', { dateTo: list.dateTo });
        }

        const [infos, total] = await queryBuilder.getManyAndCount();
        return { infos, total };
    }

    async createInfo(infoData: CreateInfoRequest): Promise<Info> {
        const repo = this.db.getRepository(Info);
        const info = new Info();
        info.type = infoData.type;
        info.level = infoData.level;
        info.text = infoData.text;
        info.user = infoData.user;
        info.date = new Date();

        return await repo.save(info);
    }
}
