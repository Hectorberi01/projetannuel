import express, { Request, Response} from "express";


export const playerRoutes = (app: express.Express) => {
     
    app.get("/healthplayer", (req: Request, res: Response) => {
        res.send({ "message": "user player" })
    })
}
