import express, { Request, Response} from "express";


export const documentsRoutes = (app: express.Express) => {
     
    app.get("/healthdocument", (req: Request, res: Response) => {
        res.send({ "message": "document" })
    })
}
