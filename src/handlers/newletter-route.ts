import express, { Request, Response} from "express";


export const newletterRoutes = (app: express.Express) => {
     
    app.get("/healthnewletter", (req: Request, res: Response) => {
        res.send({ "message": "user newletter" })
    })
}
