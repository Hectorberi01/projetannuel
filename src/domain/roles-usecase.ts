import {DataSource, DeleteResult, EntityNotFoundError} from "typeorm";
import {Role} from "../database/entities/roles";
import {CreateRoleRequest} from "../handlers/validator/roles-validator";

export interface ListRoleUseCase {
    limit: number;
    page: number;
}

export class RoleUseCase {

    constructor(private readonly db: DataSource) {
    }

    async getAllRoles(listesrole: ListRoleUseCase): Promise<{ roles: Role[], total: number }> {
        const query = this.db.getRepository(Role).createQueryBuilder('Role');

        query.skip((listesrole.page - 1) * listesrole.limit);
        query.take(listesrole.limit);

        const [roles, total] = await query.getManyAndCount();
        return {
            roles,
            total
        };
    }

    async createRole(roleData: CreateRoleRequest): Promise<Role | Error> {
        try {
            const roleRepository = this.db.getRepository(Role);

            const newRole = new Role();

            newRole.id = roleData.id;
            newRole.role = roleData.role;

            return roleRepository.save(newRole);
        } catch (error) {
            console.error("Failed to creat role:");
            throw error;
        }

    }

    async getRoleById(roleId: number): Promise<Role> {
        const sportRepository = this.db.getRepository(Role);

        const role = await sportRepository.findOne({
            where: {id: roleId}
        });

        if (!role) {
            throw new EntityNotFoundError(Role, roleId);
        }
        return role;
    }

    async DeleteRole(id_Role: number): Promise<DeleteResult> {

        const roleRepository = this.db.getRepository(Role);

        try {
            const result = await this.getRoleById(id_Role);
            if (result == null) {
                throw new Error(`${id_Role} not found`);
            }

            return await roleRepository.delete(id_Role);
        } catch (error) {
            console.error("Failed to delete role with ID:", id_Role, error);
            throw error;
        }
    }

    async upDateRoleData(id_Role: number, info: any) {
        try {
            const roleRepository = this.db.getRepository(Role);
            const result = await this.getRoleById(id_Role)

            if (result instanceof Role) {
                const role = result;
                Object.assign(role, info);
                await roleRepository.save(role)
            } else {
                throw new Error('planning not found');
            }
        } catch (error) {
            console.error("Failed to update role with ID:", id_Role, error);
        }
    }

    async getByName(name: string) {
        try {
            const roleRepository = this.db.getRepository(Role);
            const result = await roleRepository.findOne({
                where: {role: name}
            })

            if (!result) {
                throw new Error(`${name} not found`);
            }

            return result;
        } catch (error) {
            throw new Error("Failed to get role :" + name);
        }
    }
}