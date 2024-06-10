import express, {Request, Response} from "express";
import {generateValidationErrorMessage} from "./validator/generate-validation-message";
import {AppDataSource} from "../database/database";
import {createQuestionValidation} from "./validator/question-validator";
import {QuestionUseCase} from "../domain/question-usecase";


export const questionsRoutes = (app: express.Express) => {

    app.post("/questions", async (req: Request, res: Response) => {

        const questionsValidation = createQuestionValidation.validate(req.body);

        if (questionsValidation.error) {
            res.status(400).send(generateValidationErrorMessage(questionsValidation.error.details))
        }

        const questionRequest = questionsValidation.value;
        const questionUseCase = new QuestionUseCase(AppDataSource);

        try {
            const result = await questionUseCase.createQuestion(questionRequest);
            res.status(200).send(result)
        } catch (error) {
            res.status(500).send(error)
        }
    })
}