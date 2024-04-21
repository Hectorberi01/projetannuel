import express, { Request, Response} from "express";


export const functionRoutes = (app: express.Express) => {
     
    app.get("/healthfunction", (req: Request, res: Response) => {
        res.send({ "message": "user function" })
    })
}
