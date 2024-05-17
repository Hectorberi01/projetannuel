import { DataSource, DeleteResult, EntityNotFoundError } from "typeorm";
import { User } from "../database/entities/useraccount";
import express, { Request, Response} from "express";
import session from 'express-session';
import { compare, hash} from "bcrypt";
import {UserValidator}from "../handlers/validator/useraccount-validator";
import { AppDataSource } from "../database/database";
import { UserRequest } from "../handlers/validator/useraccount-validator";
import { Token } from "../database/entities/token";
import { Roles } from "../database/entities/roles";


export interface ListUserCase {
    limit: number;
    page: number;
}

export class UseruseCase{

    constructor(private readonly db: DataSource){}

    async listUser(listuser: ListUserCase): Promise<{ user: User[], total: number }> {

        const query = this.db.getRepository(User).createQueryBuilder('user')
        .leftJoinAndSelect('user.roles','roles')
        .leftJoinAndSelect('user.image','image')
        .leftJoinAndSelect('user.plannings','plannings')
        .leftJoinAndSelect('user.events','events')
        .skip((listuser.page - 1) * listuser.limit) 
        .take(listuser.limit);
        const [user, total] = await query.getManyAndCount();
        return {
            user,
            total
        };
    }

    async createUser(userData: UserRequest): Promise<User | Error> {
        try{
            const rolesRepository = this.db.getRepository(Roles);
            if(userData.role == null ){
                throw ('role est null');
            }
            // Vérifier que tous les rôles existent
            const roles = [];
            for (const roleData of userData.role) {
                const role = await rolesRepository.findOne({ where: { Id: roleData.Id } });
                if (!role) {
                throw new Error(`Le rôle avec l'ID ${roleData.Id} n'existe pas`);
                }
                roles.push(role);
            }
            const userRepository  = this.db.getRepository(User);
            const newUser = new User();
            newUser.firstname = userData.firstname,
            newUser.lastname = userData.lastname,
            newUser.email = userData.email,
            newUser.birth_date = userData.birth_date,
            newUser.date_creation = userData.creation_date,
            newUser.address = userData.address,
            newUser.roles = roles,
            newUser.image = userData.image,
            newUser.matricule = await this.generateRandomNumber(),
            newUser.password = await hash(userData.password, 10);

            return userRepository.save(newUser);
        }catch(error){
            console.error("Failed to creat user:",error);
            throw error;
        }
        
    }

    async getUserById(userid: number): Promise<User> {
        const userRepository  = this.db.getRepository(User);

        const user = await userRepository.findOne({
            where: { Id: userid },
            relations: ['events', 'plannings', 'roles', 'image'] 
        });
        if (!user) {
            throw new EntityNotFoundError(User, userid);
        }
        return user;
    }

    async getUserByEmail(email: string): Promise<User> {
        const userRepository  = this.db.getRepository(User);

        const user = await userRepository.findOne({
            where: { email: email }
        });

        if (!user) {
            throw new EntityNotFoundError(User, email);
        }
        return user;
    }

    // à impléménter
    async logoutUser(){
        const usertoken = this.db.getRepository(Token)
        const userRepository  = this.db.getRepository(User);
    }

    // Pour la suppression des utilisateur
    async DeleteUser(userid : number): Promise<DeleteResult>{

        const userRepositoryToken  = this.db.getRepository(Token);
        const userRepository  = this.db.getRepository(User);

        try {
            const result = await this.getUserById(userid);
            if(result == null){
                throw new Error(`${userid} not found`);
            }
            if (result instanceof User) {
                const user = result;
                await userRepositoryToken.delete({ user: user });
            } else {
                throw new Error(` not found`);
            }

            return await userRepository.delete(userid);
        } catch (error) {
            console.error("Failed to delete user with ID:", userid, error);
            throw error;
        }

    }

    async upDateUserData(userid : number,info : any){
        try{
            const userRepository = this.db.getRepository(User)
            console.log("info",info)
            const result  = await this.getUserById(userid)
            console.log("result",result)
            if(result instanceof User){
                const user = result;
                console.log("user = result",user)
                Object.assign(user, info);
                console.log("user",user)
               await userRepository.save(user) 
            }else {
                throw new Error('User not found');
            }
        }catch(error){
            console.error("Failed to update user with ID:", userid, error);
        }
    }

    async generateRandomNumber(): Promise<number> {
        return Math.floor(Math.random() * 900000) + 100000;
    }


    async GetUserRole(idrole : number):Promise<Roles>{
        const roleRepository  = this.db.getRepository(Roles);
        const role  = await roleRepository.findOne({
            where: {Id : idrole}
        });
        if(!role){
            throw new Error('role not fund');
        }

        return role;
    }
}





  