import express, { Request, Response} from "express";


export const formationcenterRoutes = (app: express.Express) => {
     
    app.get("/healthformation", (req: Request, res: Response) => {
        res.send({ "message": "user formation center" })
    })
}
