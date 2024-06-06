import { DataSource, DeleteResult, EntityNotFoundError, In } from "typeorm";
import { User } from "../database/entities/useraccount";
import express, { Request, Response} from "express";
import session from 'express-session';
import { compare, hash} from "bcrypt";
import {UserValidator}from "../handlers/validator/useraccount-validator";
import { AppDataSource } from "../database/database";
import { UserRequest } from "../handlers/validator/useraccount-validator";
import { Token } from "../database/entities/token";
import { Roles } from "../database/entities/roles";
import { Image } from "../database/entities/image";
import { UserDTO } from "./TDO";


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
        .leftJoinAndSelect('user.events','events')
        .skip((listuser.page - 1) * listuser.limit) 
        .take(listuser.limit);
        const [user, total] = await query.getManyAndCount();
        return {
            user,
            total
        };
    }

    async createUser(userData: any,info : any): Promise<UserDTO | Error> {
        const rolesRepository = this.db.getRepository(Roles);
        const userRepository  = this.db.getRepository(User);
        const imageRepository = this.db.getRepository(Image);
        let image: Image | null = null;

        try{
            if (info.path) {
                console.log(image)
                image = new Image();
                image.url = info.path;
                await imageRepository.save(image);
            }

            const queryRunner = this.db.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            
            try{
                const newUser = new User();

                Object.assign(newUser,userData);

                const roleIds = userData.roles.map((role: Roles) => role.Id);
                const roles = await rolesRepository.find({
                    where: { Id: In(roleIds) }
                });

                newUser.roles = roles
                
                // Générer un matricule et hacher le mot de passe
                newUser.matricule = await this.generateRandomNumber();
                newUser.password = await hash(userData.password, 10);

                // Assurez-vous que date_creation est définie
                if (!newUser.date_creation) {
                    newUser.date_creation = new Date();
                }

                // Si une image a été créée, l'associer à l'utilisateur
                if (image) {
                    newUser.image = image;
                    image.users = newUser;
                    await queryRunner.manager.save(image);
                }

                // Sauvegarder le nouveau club
                await queryRunner.manager.save(newUser);
                await queryRunner.commitTransaction();

                //return newUser
                return new UserDTO(newUser);
            }catch(error){
                await queryRunner.rollbackTransaction();
                console.error("Failed to creat club :", error);
                throw error
            }finally{
                await queryRunner.release();
            }

        }catch(error){
            console.error("Failed to creat user:",error);
            return new Error("Failed to create user");
        }
        
    }

    async getUserById(userid: number): Promise<User> {
        const userRepository  = this.db.getRepository(User);

        const user = await userRepository.findOne({
            where: { id: userid },
            relations: ['events','roles', 'image'] 
        });
        if (!user) {
            throw new EntityNotFoundError(User, userid);
        }
        return user;
    }

    async getUserByEmail(email: string): Promise<User> {
        const userRepository  = this.db.getRepository(User);

        const user = await userRepository.findOne({
            where: { email: email },
            relations: ['events','roles', 'image'] 
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





  