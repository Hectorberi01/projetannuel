import {DataSource} from "typeorm";
import {CreateQuestionRequest} from "../handlers/validator/question-validator";
import {Question} from "../database/entities/question";
import {AppDataSource} from "../database/database";
import {SondageUseCase} from "./sondage-usecase";

export class QuestionUseCase {

    constructor(private readonly db: DataSource) {
    }

    async createQuestion(questionData: CreateQuestionRequest): Promise<Question | Error> {

        try {
            const questionRepository = this.db.getRepository(Question);
            const sondageUseCase = new SondageUseCase(AppDataSource)

            const sondage = await sondageUseCase.getSondageById(questionData.sondageId);

            if (!sondage) {
                throw new Error('Le sondage demandé n\' existe pas');
            }

            let question = new Question();

            question.text = questionData.text;
            question.sondage = sondage;

            return questionRepository.save(question);
        } catch (error: any) {
            throw new Error("failed to create new sondage : " + error.message);
        }
    }
}