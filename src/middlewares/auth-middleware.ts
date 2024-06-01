import {NextFunction, Request, Response} from "express";
import {UseruseCase} from "../domain/user-usecase";
import {AppDataSource} from "../database/database";
require('dotenv').config();
import jwt, { VerifyErrors } from 'jsonwebtoken';



const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ error: 'No token provided' });
    }
    console.log("authHeader ",authHeader)
    const token = authHeader && authHeader.split(' ')[1];
    console.log("token",token)
    if(token == null) return res.sendStatus(401)

    // @ts-ignore
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: VerifyErrors | null, user: object | undefined) =>{
        if(err) return res.sendStatus(403)

        // @ts-ignore
        req.user = user;
        next();
    })    
    console.log("beri")
};

const isAdmin = async (user: any) => {
    try {
        const useruseCase = new UseruseCase(AppDataSource);
        const userDb = await useruseCase.getUserById(user.userId);

        if (!user) {
            return false;
        }
        // @ts-ignore
        const roles = userDb.roles.split(";");
        return roles.includes("admin")
    } catch (error) {
        return false;
    }
}
export {authMiddleware, isAdmin};