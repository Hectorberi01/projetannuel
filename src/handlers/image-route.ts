import express, { Request, Response} from "express";


export const imageRoutes = (app: express.Express) => {
     
    app.get("/healthimage", (req: Request, res: Response) => {
        res.send({ "message": "image" })
    })
}
