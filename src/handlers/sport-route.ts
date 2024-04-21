import express, { Request, Response} from "express";


export const sportRoutes = (app: express.Express) => {
     
    app.get("/healthsport", (req: Request, res: Response) => {
        res.send({ "message": "user route" })
    })
}
