import { DataSource } from "typeorm";
import { Sondage } from "../database/entities/sondage";
import { CreateSondageRequest } from "../handlers/validator/sondage-validator";

export interface listSondage {
    limit: number;
    page: number;
    finished: boolean;
}

export class SondageUseCase {

    constructor(private readonly db: DataSource) { }

    async getAllSondages(listSondageRequest: listSondage): Promise<{ sondages: Sondage[], total: number }> {
        const query = this.db.getRepository(Sondage);
        query.leftJoinAndSelect('sondage.questions', 'questions');

        query.skip((listSondageRequest.page - 1) * listSondageRequest.limit);
        query.take(listSondageRequest.limit);

        const [sondages, total] = await query.getManyAndCount();
        return {
            sondages,
            total
        };
    }

    async createSondage(sondageData: CreateSondageRequest): Promise<Sondage | Error> {

        try {

            const sondageRepository = this.db.getRepository(Sondage);
            let sondage = new Sondage();

            sondage.name = sondageData.name;
            sondage.startDate = sondageData.startDate;
            sondage.endDate = sondageData.endDate;
            sondage.createdAt = new Date();
            sondage.createdBy = sondageData.createdBy;

            return sondageRepository.save(sondage);
        } catch (error: any) {
            throw new Error("failed to create new sondage : " + error.message);
        }
    }

    async getSondageById(id: number): Promise<Sondage> {
        const sondageRepository = this.db.getRepository(Sondage);

        const sondage = await sondageRepository.findOne({
            where: { id: id },
            relations: ['Questions']
        });

        if (!sondage) {
            throw new Error("unknown pool asked");
        }
        return sondage;
    }
}