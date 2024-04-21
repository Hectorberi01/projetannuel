import express, { Request, Response} from "express";


export const userRoutes = (app: express.Express) => {
     
    app.get("/healthuser", (req: Request, res: Response) => {
        res.send({ "message": "user route" })
    })
}
