import express, {Request, Response} from "express";
import {AppDataSource} from "../database/database";
import {StatsUseCase} from "../domain/stats-usecase";

export const statsRoutes = (app: express.Express) => {

    app.get("/stats", async (req: Request, res: Response) => {
        try {
            const statsUseCase = new StatsUseCase(AppDataSource);
            const stats = await statsUseCase.getStats();
            res.status(200).send(stats);
        } catch (error: any) {
            res.status(500).send({error: error.message});
        }
    });
}