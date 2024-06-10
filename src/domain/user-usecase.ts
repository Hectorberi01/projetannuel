import {DataSource, EntityNotFoundError} from "typeorm";
import {User} from "../database/entities/user";
import {CreateUserRequest, LoginUserRequest} from "../handlers/validator/user-validator";
import {RoleUseCase} from "./roles-usecase";
import {AppDataSource} from "../database/database";
import {ClubUseCase} from "./club-usecase";
import {FormationCenterUseCase} from "./formationcenter-usecase";
import {PlayerUseCase} from "./player-usercase";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface ListUserCase {
    limit: number;
    page: number;
}

export class UseruseCase {

    constructor(private readonly db: DataSource) {
    }

    async getAllUsers(listuser: ListUserCase): Promise<{ user: User[], total: number }> {

        const query = this.db.getRepository(User).createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.events', 'events')
            .skip((listuser.page - 1) * listuser.limit)
            .take(listuser.limit);
        const [user, total] = await query.getManyAndCount();
        return {
            user,
            total
        };
    }

    async createUser(userData: CreateUserRequest): Promise<User> {

        const userRepository = this.db.getRepository(User);
        const roleUseCase = new RoleUseCase(AppDataSource);

        const alreadyExist = await this.getUserByEmail(userData.email);
        if (alreadyExist != null) {
            throw new Error("email est déjà associé à un compte");
        }

        let user = new User();
        user.email = userData.email;
        user.firstname = userData.firstName;
        user.lastname = userData.lastName;
        user.address = userData.address;
        user.newsletter = userData.newsletter;
        user.birthDate = userData.birthDate;
        user.createDate = new Date();

        const role = await roleUseCase.getRoleById(parseInt(userData.roleId));
        user.role = role;

        if (role.role === "CLUB") {
            const clubUseCase = new ClubUseCase(AppDataSource);
            // @ts-ignore
            const club = await clubUseCase.getClubById(parseInt(userData.clubId));
            user.club = club;
        } else if (role.role === "FOMATIONCENTER") {
            const formationCenterUseCase = new FormationCenterUseCase(AppDataSource);
            // @ts-ignore
            const formationCenter = await formationCenterUseCase.getFormationCenterById(parseInt(userData.formationCenterId));
            user.formationCenter = formationCenter;
        } else if (role.role === "PLAYER") {
            const playerUseCase = new PlayerUseCase(AppDataSource);
            // @ts-ignore
            const player = await playerUseCase.getPlayerById(parseInt(userData.playerId));
            user.player = player;
        } else if (role.role === "ADMIN") {

        } else {
            throw new Error("this type of role is not implemented yet.");
        }

        const tmpPassword = await this.generateTemporaryPassword();
        user.password = await this.hashPassword(tmpPassword);
        user.matricule = await this.generateUserMatricule(user);
        user.deleted = false;
        return userRepository.save(user);
    }

    async login(userRequest: LoginUserRequest): Promise<{ user: User, token: string }> {
        const potentialUser = await this.getUserByEmail(userRequest.login);

        if (!potentialUser) {
            throw new Error("Email ou mot de passe incorrect");
        }

        const isPasswordValid = await bcrypt.compare(userRequest.password, potentialUser.password);

        if (!isPasswordValid) {
            throw new Error("Email ou mot de passe incorrect");
        }

        const token = this.generateToken(potentialUser);
        potentialUser.password = "{noop}"

        return {user: potentialUser, token};
    }

    generateToken(user: User): string {
        const payload = {
            userId: user.id,
            role: user.role.role
        };
        const secret = process.env.JWT_SECRET || 'default_secret_key';
        const options = {expiresIn: '1h'};

        return jwt.sign(payload, secret, options);
    }

    async getUserById(userid: number): Promise<User> {
        const userRepository = this.db.getRepository(User);
        const user = await userRepository.findOneById(userid);

        if (!user) {
            throw new EntityNotFoundError(User, userid);
        }

        return user;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const userRepository = this.db.getRepository(User);

        return await userRepository.findOne({
            where: {email: email},
            relations: ['role']
        });

    }

    async generateTemporaryPassword(): Promise<string> {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@.!/&+=-*";
        let password = "";
        for (let i = 0; i < 11; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    async generateUserMatricule(user: User): Promise<string> {
        const userRepository = this.db.getRepository(User);
        const count = await userRepository.count();
        const paddedCount = (count + 1).toString().padStart(5, '0');

        const roleInitial = user.role.role.charAt(0).toUpperCase();
        const firstNameInitial = user.firstname.charAt(0).toUpperCase();
        const lastNameInitial = user.lastname.charAt(0).toUpperCase();

        return `${roleInitial}-${firstNameInitial}${lastNameInitial}-${paddedCount}`;
    }

    async getRecentsUsers(): Promise<User[]> {
        const userRepository = this.db.getRepository(User);
        return await userRepository.find({
            order: {
                id: 'DESC'
            },
            take: 3
        });
    }
}





  