import {DataSource} from "typeorm";
import {Sondage} from "../database/entities/sondage";
import {CreateSondageRequest} from "../handlers/validator/sondage-validator";
import {Answer} from "../database/entities/answer";
import {User} from "../database/entities/useraccount";
import {Question} from "../database/entities/question";
import {UseruseCase} from "./user-usecase";
import {AppDataSource} from "../database/database";

export interface listSondage {
    limit: number;
    page: number;
    finished: boolean;
}

export class SondageUseCase {

    constructor(private readonly db: DataSource) {
    }

    async getAllSondages(listSondageRequest: listSondage): Promise<{ sondages: Sondage[], total: number }> {
        const query = this.db.createQueryBuilder(Sondage, 'sondage');

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
            const userUseCase = new UseruseCase(AppDataSource);
            const sondageRepository = this.db.getRepository(Sondage);
            let sondage = new Sondage();

            const user = await userUseCase.getUserById(sondageData.userId);

            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            sondage.name = sondageData.name;
            sondage.startDate = sondageData.startDate;
            sondage.endDate = sondageData.endDate;
            sondage.createdAt = new Date();
            sondage.createdBy = user;

            return sondageRepository.save(sondage);
        } catch (error: any) {
            throw new Error("failed to create new sondage : " + error.message);
        }
    }

    async getSondageById(id: number): Promise<Sondage> {
        const sondageRepository = this.db.getRepository(Sondage);

        const sondage = await sondageRepository.findOne({
            where: {id: id},
            relations: {
                questions: true
            }
        });

        if (!sondage) {
            throw new Error("unknown pool asked");
        }
        return sondage;
    }

    async voteForSondage(idSondage: number, idQuestion: number, idUser: number): Promise<Answer | null> {
        const sondageRepository = this.db.getRepository(Sondage);
        const answerRepository = this.db.getRepository(Answer);
        const userRepository = this.db.getRepository(User);
        const questionRepository = this.db.getRepository(Question)

        const sondage = await sondageRepository.findOneBy({id: idSondage});

        if (!sondage) {
            throw new Error("Unknown pool");
        }

        const question = await questionRepository.findOneBy({id: idQuestion});

        if (!question) {
            throw new Error("Unkown answer");
        }

        const user = await userRepository.findOneBy({id: idUser});

        if (!user) {
            throw new Error("Unknown user");
        }

        // on vérifie si le user à déjà voté pour ce sondage
        const potentiaAnwser = await this.verifyIfUserAlreadyVoted(sondage.id, user.id);

        if (potentiaAnwser) {
            throw new Error("Vous avez déjà voté");
        }

        // on creer le vote du user
        const answer = new Answer();
        answer.question = question;
        answer.sondage = sondage;
        answer.user = user;
        answer.createdAt = new Date();

        const result = await answerRepository.save(answer);

        if (!result) {
            throw new Error("Error while creating answer")
        } else {
            return result;
        }
    }

    async getAnswersOfSondage(idSondage: number): Promise<{ answers: Answer[], total: number } | null> {
        const answerRepository = this.db.getRepository(Answer);
        const sondage = await this.getSondageById(idSondage);

        if (!sondage) {
            throw new Error("Unknown pool");
        }

        const [answers, total] = await answerRepository.findAndCount({
            where: {sondage: sondage},
            relations: {
                question: true
            }
        });

        return {
            answers,
            total,
        };
    }

    async verifyIfUserAlreadyVoted(idSondage: number, idUser: number): Promise<boolean> {

        const userRepository = this.db.getRepository(User);
        const sondageRepository = this.db.getRepository(Sondage);
        const answerRepository = this.db.getRepository(Answer);

        const user = await userRepository.findOneBy({id: idUser});

        if (!user) {
            throw new Error("Unknown user");
        }

        const sondage = await sondageRepository.findOneBy({id: idSondage});

        if (!sondage) {
            throw new Error("Unknown sondage");
        }
        const potentialAnwser = await answerRepository.findOne({
            where: {user: user, sondage: sondage}
        });

        return potentialAnwser != null;
    }
}