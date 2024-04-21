import express, { Request, Response} from "express";


export const dontsRoutes = (app: express.Express) => {
     
    app.get("/healthdonts", (req: Request, res: Response) => {
        res.send({ "message": "donts" })
    })
}
