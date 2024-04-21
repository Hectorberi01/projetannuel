import express, { Request, Response} from "express";


export const useraccountRoutes = (app: express.Express) => {
     
    app.get("/healthuseraccount", (req: Request, res: Response) => {
        res.send({ "message": "user account" })
    })
}
