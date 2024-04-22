import { DataSource } from "typeorm";
import { User } from "../database/entities/useraccount";
import express, { Request, Response} from "express";
import session from 'express-session';
import { compare, hash} from "bcrypt";
import {UserValidator, LoginUserValidation}from "../handlers/validator/user-validator";
import { AppDataSource } from "../database/database";


export class UseruseCase{

    constructor(private readonly db: DataSource){}

    async createUser(userData: UserValidator): Promise<User | Error> {

        const userRepository  = this.db.getRepository(User);

        const newUser = new User();

       

        return newUser
    }


}





  