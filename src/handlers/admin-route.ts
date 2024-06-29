import express, {Request, Response} from "express";
import {AppDataSource} from "../database/database";
import {AdminUseCase} from "../domain/admin-usecase";


export const adminRoute = (app: express.Express) => {

    app.put("/admin/tools/reindex-database", async (req: Request, res: Response) => {
        try {
            const useCase = new AdminUseCase(AppDataSource);
            await useCase.reindexDatabase();
            res.status(200).send({ message: 'Database reindexing completed successfully.' });
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    });
}