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

        newUser.name = userData.name;
        newUser.lastname = userData.lastname;
        newUser.email = userData.email;
        newUser.adress = userData.adress;
        newUser.age = userData.age;
        newUser.password = await hash(userData.password, 10);
        newUser.matricule = userData.matricule;
        newUser.role = userData.role;
        newUser.anciennete = userData.anciennete;


        return newUser
    }


}





  