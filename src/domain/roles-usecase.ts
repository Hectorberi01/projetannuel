import { DataSource, DeleteResult, EntityNotFoundError } from "typeorm";
import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";
import { Roles } from "../database/entities/roles";
import { RoleRequest } from "../handlers/validator/roles-validator";

export interface ListRoleUseCase {
    limit: number;
    page: number;
}

export class RoleUseCase{

    constructor(private readonly db: DataSource){}

    async ListeRole(listesrole: ListRoleUseCase): Promise<{ roles: Roles[], total: number }> {
        const query = this.db.getRepository(Roles).createQueryBuilder('Role');

        query.skip((listesrole.page - 1) * listesrole.limit);
        query.take(listesrole.limit);

        const [roles, total] = await query.getManyAndCount();
        return {
            roles,
            total
        };
    }

    async CreatRole(roleData :RoleRequest ):Promise<Roles | Error>{
        try{
            const roleRepository  = this.db.getRepository(Roles);
    
            const newRole = new Roles();
    
            newRole.Id = roleData.Id;
            newRole.Role = roleData.Role;
    
            return roleRepository.save(newRole);
        }catch(error){
            console.error("Failed to creat role:");
            throw error;
        }
        
    }

    async getRoleById(id_Role: number): Promise<Roles> {
        try{
            const sportRepository  = this.db.getRepository(Roles);

            const role = await sportRepository.findOne({
                where: { Id: id_Role }
            });

            if (!role) {
                throw new EntityNotFoundError(Roles, id_Role);
            }
            return role;
        }catch(error){
            console.error("Failed to role with ID:",id_Role, error);
            throw error;
        }
    }

    async DeleteRole(id_Role : number): Promise<DeleteResult>{

        const roleRepository  = this.db.getRepository(Roles);

        try {
            const result = await this.getRoleById(id_Role);
            if(result == null){
                throw new Error(`${id_Role} not found`);
            }

            return await roleRepository.delete(id_Role);
        } catch (error) {
            console.error("Failed to delete role with ID:", id_Role, error);
            throw error;
        }
    }

    async upDateRoleData(id_Role : number,info : any){
        try{
            const roleRepository  = this.db.getRepository(Roles);
            console.log("info",info)
            const result  = await this.getRoleById(id_Role)
            console.log("result",result)

            if(result instanceof Roles){
                const role = result;
                Object.assign(role, info);
               await roleRepository.save(role) 
            }else {
                throw new Error('planning not found');
            }
        }catch(error){
            console.error("Failed to update role with ID:", id_Role, error);
        }
    }
}