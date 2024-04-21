import express, { Request, Response} from "express";


export const eventsRoutes = (app: express.Express) => {
     
    app.get("/healthevents", (req: Request, res: Response) => {
        res.send({ "message": "events" })
    })
}
