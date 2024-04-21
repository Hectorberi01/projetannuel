import express, { Request, Response} from "express";


export const roleRoutes = (app: express.Express) => {
     
    app.get("/healthrole", (req: Request, res: Response) => {
        res.send({ "message": "user route" })
    })
}
