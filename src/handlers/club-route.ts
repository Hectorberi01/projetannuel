import express, { Request, Response} from "express";


export const clubRoutes = (app: express.Express) => {
     
    app.get("/healthclub", (req: Request, res: Response) => {
        res.send({ "message": "clud" })
    })
}
