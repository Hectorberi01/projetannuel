import {DataSource} from "typeorm";
import {Info} from "../database/entities/info";
import {CreateInfoRequest} from "../handlers/validator/info-validator";

export interface ListInfosRequest {
    limit: number;
    page: number;
}


export class InfoUseCase {
    constructor(private readonly db: DataSource) {
    }

    async getAllInfos(list: ListInfosRequest): Promise<{ infos: Info[], total: number }> {
        const repo = this.db.getRepository(Info);
        const [infos, total] = await repo.findAndCount({
            skip: (list.page - 1) * list.limit,
            take: list.limit,
            relations: ['user'],
            order: {date: "DESC"}
        });
        return {infos, total};
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
