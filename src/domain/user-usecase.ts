import {DataSource, EntityNotFoundError, Repository} from "typeorm";
import {User} from "../database/entities/user";
import {
    ChangePasswordRequest,
    CreateUserRequest,
    InvitedUserRequest,
    LoginUserRequest,
    UpdateUserRequest
} from "../handlers/validator/user-validator";
import {RoleUseCase} from "./roles-usecase";
import {ClubUseCase} from "./club-usecase";
import {FormationCenterUseCase} from "./formationcenter-usecase";
import {PlayerUseCase} from "./player-usercase";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {ImageUseCase} from "./image-usecase";
import {MessageUseCase} from "./message-usecase";
import {MessageType} from "../Enumerators/MessageType";
import {v4 as uuidv4} from 'uuid';
import {Role} from "../Enumerators/Role";
import {Club} from "../database/entities/club";
import {Player} from "../database/entities/player";
import {CotisationUseCase} from "./cotisation-usecase";
import {EntityType} from "../Enumerators/EntityType";
import {InfoUseCase} from "./info-usecase";
import {CreateInfoRequest} from "../handlers/validator/info-validator";
import {InfoType} from "../Enumerators/InfoType";
import {InfoLevel} from "../Enumerators/InfoLevel";
import {EmailUseCase} from "./email-usecase";
import {AppDataSource} from "../database/database";
import {Email} from "../database/entities/email";
import {DocumentUseCase} from "./documents-usecase";
import {FormationCenter} from "../database/entities/formationcenter";


export interface ListUserRequest {
    limit: number;
    page: number;
    deleted?: boolean
    firstName?: string
    lastName?: string
    email?: string
    roleId?: number
}

export class UseruseCase {

    // usecases
    private infoUseCase: InfoUseCase;
    private messageUseCase: MessageUseCase;
    private cotisationUseCase: CotisationUseCase;
    private imageUseCase: ImageUseCase;
    private roleUseCase: RoleUseCase;
    private clubUseCase: ClubUseCase;
    private formationCenterUseCase: FormationCenterUseCase;
    private playerUseCase: PlayerUseCase;

    // repositories
    private userRepository: Repository<User>;
    private playerRepository: Repository<Player>;

    constructor(private readonly db: DataSource) {
        this.infoUseCase = new InfoUseCase(db);
        this.messageUseCase = new MessageUseCase(db);
        this.cotisationUseCase = new CotisationUseCase(db);
        this.imageUseCase = new ImageUseCase(db);
        this.roleUseCase = new RoleUseCase(db);
        this.clubUseCase = new ClubUseCase(db);
        this.formationCenterUseCase = new FormationCenterUseCase(db);
        this.playerUseCase = new PlayerUseCase(db);

        this.userRepository = this.db.getRepository(User);
        this.playerRepository = this.db.getRepository(Player);
    }


    async getAllUsers(filters: ListUserRequest): Promise<{ user: User[], total: number }> {
        const query = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.deleted = :deleted', {deleted: filters.deleted ?? false});

        if (filters.firstName) {
            query.andWhere('user.firstName LIKE :firstName', {firstName: `%${filters.firstName}%`});
        }

        if (filters.lastName) {
            query.andWhere('user.lastName LIKE :lastName', {lastName: `%${filters.lastName}%`});
        }

        if (filters.email) {
            query.andWhere('user.email LIKE :email', {email: `%${filters.email}%`});
        }

        if (filters.roleId) {
            query.andWhere('role.id = :roleId', {roleId: filters.roleId});
        }

        query.skip((filters.page - 1) * filters.limit)
            .take(filters.limit);

        const [user, total] = await query.getManyAndCount();
        return {
            user,
            total
        };
    }

    async createUser(userData: CreateUserRequest, file: Express.Multer.File | undefined): Promise<User> {
        try {
            const documentUseCase = new DocumentUseCase(AppDataSource);
            const alreadyExist = await this.getUserByEmail(userData.email);
            if (alreadyExist != null) {
                throw new Error("L'email est déjà associé à un compte");
            }

            let user = new User();
            user.email = userData.email;
            user.firstname = userData.firstName;
            user.lastname = userData.lastName;
            user.address = userData.address;
            user.newsletter = userData.newsletter;
            user.birthDate = userData.birthDate;
            user.createDate = new Date();
            user.firstConnection = false;

            const role = await this.roleUseCase.getRoleById(parseInt(userData.roleId));
            user.role = role;

            if (role.role === "CLUB" || role.role === "ADMIN_CLUB") {
                // @ts-ignore
                user.club = await this.clubUseCase.getClubById(parseInt(userData.clubId));
            } else if (role.role === "FORMATIONCENTER" || role.role === "ADMIN_FORMATIONCENTER") {
                // @ts-ignore
                user.formationCenter = await this.formationCenterUseCase.getFormationCenterById(parseInt(userData.formationCenterId));
            } else if (role.role === "PLAYER") {
                // @ts-ignore
                const player = await this.playerUseCase.getPlayerById(parseInt(userData.playerId));
                user.player = player;
            } else if (role.role !== "ADMIN") {
                throw new Error("Ce type de rôle n'est pas encore implémenté.");
            }

            const tmpPassword = await this.escapeHtml(await this.generateTemporaryPassword());
            user.password = await this.hashPassword(tmpPassword);
            user.matricule = await this.generateUserMatricule(user);
            user.deleted = false;

            if (file != null) {
                const uploadedImage = await this.imageUseCase.createImage(file);
                if (uploadedImage) {
                    // @ts-ignore
                    user.image = uploadedImage;
                }
            }

            user = await this.userRepository.save(user);

            if (role.role === "PLAYER" && user.player) {
                const player = user.player;
                player.user = user; // Link the user to the player
                await this.playerRepository.save(player); // Save the updated player
            }

            await this.messageUseCase.sendMessage(MessageType.FIRST_CONNECTION, user, tmpPassword);
            await documentUseCase.createFolder(user.matricule, user.id);
            if (user.role.role !== "ADMIN") {
                await this.cotisationUseCase.createCotisation(EntityType.USER, user.id)
            } else {
                await this.generateCotisationCardFromUser(user.id);
            }
            let infoRequest: CreateInfoRequest = {
                type: InfoType.USER_CREATE,
                level: InfoLevel.LOW,
                text: `Utilisateur ${user.firstname} ${user.lastname} [${user.id}] a bien été créé`,
                user: user
            }
            await this.infoUseCase.createInfo(infoRequest);
            return user;
        } catch (error: any) {
            throw new Error("Erreur lors de la création de l'utilisateur: " + error.message);
        }
    }

    async login(userRequest: LoginUserRequest): Promise<{ user: User, token?: string }> {
        const potentialUser = await this.getUserByEmail(userRequest.login);

        if (!potentialUser) {
            throw new Error("Email ou mot de passe incorrect");
        }

        if (potentialUser.deleted) {
            throw new Error("Votre compte est supprimé, veuillez contacter le support client");
        }

        const isPasswordValid = await bcrypt.compare(userRequest.password, potentialUser.password);

        if (!isPasswordValid) {
            throw new Error("Email ou mot de passe incorrect");
        }

        if (potentialUser.a2fEnabled) {
            await this.generateAndSendA2FCode(potentialUser.id);
            return {user: potentialUser};
        }

        const token = await this.generateToken(potentialUser);
        potentialUser.password = "{noop}"

        return {user: potentialUser, token};
    }

    async generateToken(user: User): Promise<string> {
        const payload = {
            userId: user.id,
            role: user.role.role
        };
        const secret = process.env.JWT_SECRET || 'default_secret_key';
        const options = {expiresIn: '1h'};

        return jwt.sign(payload, secret, options);
    }

    async getUserById(userId: number): Promise<User> {
        const user = await this.userRepository.createQueryBuilder("user")
            .leftJoinAndSelect("user.role", "role")
            .leftJoinAndSelect("user.club", "club")
            .leftJoinAndSelect("user.formationCenter", "formationCenter")
            .leftJoinAndSelect("user.player", "player")
            .leftJoinAndSelect("user.image", "image")
            .leftJoinAndSelect("user.folders", "folders")
            .where("user.id = :id", {id: userId})
            .getOne();

        if (!user) {
            throw new EntityNotFoundError(User, userId);
        }

        return user;
    }

    async getUserByEmail(email: string): Promise<User | null> {

        return await this.userRepository.findOne({
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

    async getRecentUsers(): Promise<User[]> {
        return await this.userRepository.find({
            order: {
                id: 'DESC'
            },
            take: 3
        });
    }

    async changePasswordFirstConnection(userId: number, newPassword: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {id: userId}
        });

        if (!user) {
            throw new Error("Utilisateur inconnu");
        }
        if (user.firstConnection) {
            throw new Error("Mot de passe déjà changé");
        }
        user.password = await this.hashPassword(newPassword);
        user.firstConnection = true;

        const result = await this.userRepository.save(user);
        if (!result) {
            throw new Error("Erreur lors du changement de mot de passe");
        }
        await this.messageUseCase.sendMessage(MessageType.PASSWORD_CHANGED, user, null);

        let infoRequest: CreateInfoRequest = {
            type: InfoType.USER_CHANGE_PASSWORD,
            level: InfoLevel.MODERATE,
            text: `utilisateur ${user.firstname} ${user.lastname} [${user.id}] a changé son mot de passe`,
            user: user
        }
        await this.infoUseCase.createInfo(infoRequest);

        return result;
    }

    async deactivateUserById(userId: number): Promise<User> {
        const user = await this.getUserById(userId);

        if (!user) {
            throw new Error("Utilisateur inconnu");
        }

        user.deleted = true;
        const result = await this.userRepository.save(user);

        let infoRequest: CreateInfoRequest = {
            type: InfoType.USER_DEACTIVATE,
            level: InfoLevel.HIGH,
            text: `Utilisateur ${user.firstname} ${user.lastname} [${user.id}] a bien été désactivé`,
            user: user
        }
        await this.infoUseCase.createInfo(infoRequest);
        await this.messageUseCase.sendMessage(MessageType.USER_DEACTIVATE, user, user);
        return result;
    }

    async changePassword(userId: number, changePassword: ChangePasswordRequest): Promise<User> {
        const user = await this.getUserById(userId);

        if (!user) {
            throw new Error("Utilisateur inconnu");
        }

        const oldPasswordMatch = await bcrypt.compare(changePassword.oldPassword, user.password);

        if (!oldPasswordMatch) {
            throw new Error("Mot de passe actuel invalide");
        }

        user.password = await this.hashPassword(changePassword.newPassword);
        const result = await this.userRepository.save(user);
        await this.messageUseCase.sendMessage(MessageType.PASSWORD_CHANGED, user, null)

        let infoRequest: CreateInfoRequest = {
            type: InfoType.USER_CHANGE_PASSWORD,
            level: InfoLevel.LOW,
            text: `user ${user.firstname} ${user.lastname} [${user.id}] a changé son mot de passe`,
            user: user
        }
        await this.infoUseCase.createInfo(infoRequest);
        return result;
    }

    async generateAndSendA2FCode(userId: number) {
        const user = await this.getUserById(userId);

        if (!user) {
            throw new Error("Utilisateur inconnu");
        }

        const a2fCode = uuidv4().slice(0, 6);
        user.a2fCode = a2fCode;
        user.a2fCodeCreatedAt = new Date();

        await this.userRepository.save(user);
        await this.messageUseCase.sendMessage(MessageType.A2F_CODE, user, a2fCode);
    }

    async validateA2FCode(userId: number, code: string): Promise<{ token: string }> {
        const user = await this.getUserById(userId);
        if (!user || !user.a2fCode || !user.a2fCodeCreatedAt) {
            throw new Error("Un problème est survenu, veuillez réessayer plus tard");
        }

        const now = new Date();
        const codeCreationTime = new Date(user.a2fCodeCreatedAt);
        const timeDiff = (now.getTime() - codeCreationTime.getTime()) / 1000 / 60;

        if (timeDiff > 15 || user.a2fCode !== code) {
            throw new Error("Code A2F invalide ou expiré");
        }

        const token = await this.generateToken(user);
        return {token};
    }

    async createEntityUser(entity: any, roleData: Role): Promise<void> {
        const role = await this.roleUseCase.getByName(roleData);
        let user: CreateUserRequest = {
            email: entity.email,
            address: '',
            newsletter: false,
            lastName: '',
            firstName: '',
            roleId: role.id.toString(),
            birthDate: new Date(),
            clubId: null,
            playerId: null,
            formationCenterId: null
        };
        switch (roleData) {
            case Role.ADMIN_CLUB:
                user.clubId = entity.id;
                break;
            case Role.ADMIN_FORMATIONCENTER:
                user.formationCenterId = entity.id;
                break;
            case Role.PLAYER:
                user.firstName = entity.firstName;
                user.lastName = entity.lastName;
                user.address = ' ';
                user.playerId = entity.id;
                user.birthDate = entity.birthDate;
                break;
            default:
                break;
        }
        await this.createUser(user, undefined);
        return;
    }

    async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error("Utilisateur inconnu");
            }

            if (userData.firstName && user.firstname !== userData.firstName) {
                user.firstname = userData.firstName;
            }

            if (userData.lastName && user.lastname !== userData.lastName) {
                user.lastname = userData.lastName;
            }

            if (userData.address && user.address !== userData.address) {
                user.address = userData.address;
            }

            if (userData.a2fEnabled && user.a2fEnabled !== userData.a2fEnabled) {
                user.a2fEnabled = userData.a2fEnabled;
            }

            if (userData.newsletter && user.newsletter !== userData.newsletter) {
                user.newsletter = userData.newsletter;
            }

            return await this.userRepository.save(user);
        } catch (error: any) {
            throw new Error("Erreur de mise à jour");
        }
    }

    async createInvitedUser(invitedUser: InvitedUserRequest, hostId: number): Promise<User> {
        try {
            const host = await this.getUserById(hostId);
            if (!host) {
                throw new Error("Utilisateur inconnu");
            }
            let user: CreateUserRequest = {
                email: invitedUser.email,
                firstName: invitedUser.firstName,
                lastName: invitedUser.lastName,
                address: invitedUser.address,
                birthDate: invitedUser.birthDate,
                newsletter: false,
                roleId: '',
                clubId: null,
                playerId: null,
                formationCenterId: null,
            }

            if (host.club) {
                return await this.fillUpInvitedUser(user, host, Role.CLUB)
            } else if (host.formationCenter) {
                return await this.fillUpInvitedUser(user, host, Role.FORMATIONCENTER)
            } else {
                throw new Error("Ce type d'invité n'est pas implémenté");
            }

        } catch (error) {
            throw new Error("Erreur lors de l'invitation")
        }
    }

    async fillUpInvitedUser(user: CreateUserRequest, host: User, role: Role): Promise<User> {
        try {
            const invitedRole = await this.roleUseCase.getByName(role.toString());

            if (!invitedRole) {
                throw new Error("Utilisateur inconnu");
            }

            switch (role) {
                case Role.CLUB:
                    user.clubId = host.club.id.toString();
                    user.roleId = invitedRole.id.toString();
                    break;
                case Role.FORMATIONCENTER:
                    user.formationCenterId = host.formationCenter.id.toString();
                    user.roleId = invitedRole.id.toString();
                    break;
                default:
                    throw new Error("Ce type d'invité n'est pas implémenté");
            }
            return await this.createUser(user, undefined);
        } catch (error) {
            throw new Error("Erreur lors de l'invitation")
        }
    }

    async getNewsletterUsers(): Promise<User[]> {
        return await this.userRepository.find({
            where: {newsletter: true}
        })
    }

    async getAllClubUsers(club: Club): Promise<User[]> {
        return await this.userRepository.find({
            where: {club: club}
        })
    }

    async getAllFCUsers(fc: FormationCenter): Promise<User[]> {
        return await this.userRepository.find({
            where: {formationCenter: fc}
        })
    }

    async getClubByUser(userId: number): Promise<Club> {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error("Utilisateur inconnu");
            }

            return user.club;
        } catch (error) {
            throw new Error("Erreur lors de la récupération du club")
        }
    }

    async getPlayerByUser(userId: number): Promise<Player> {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error("Utilisateur inconnu");
            }

            return user.player;
        } catch (error) {
            throw new Error("Erreur lors de la récupération du club")
        }
    }

    async getFormationCenterByUser(userId: number): Promise<FormationCenter> {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error("Utilisateur inconnu");
            }

            return user.formationCenter;
        } catch (error) {
            throw new Error("Erreur lors de la récupération du club")
        }
    }

    async getSportVisionUser(): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {email: "sportvision.infos@gmail.com"}
        })

        if (!user) {
            throw new Error("Utilisateur inconnu");
        }

        return user;
    }

    async generateCotisationCard(): Promise<void> {
        try {
            const cotisationUseCase = new CotisationUseCase(this.db);
            const users = await cotisationUseCase.getUsersWithCotisationPaidYesterday();

            for (let user of users) {
                if (!user) {
                    continue;
                }
                user = await this.getUserById(user.id);
                const card = await this.createMembershipCard(user);
                await this.saveMembershipCard(card, user);
                await this.sendMembershipCardNotification(user);
                let infoRequest: CreateInfoRequest = {
                    type: InfoType.CREATE_CARD,
                    level: InfoLevel.LOW,
                    text: `La carte adhérente de ${user.firstname} ${user.lastname} [${user.id}] a bien été générée`,
                    user: await this.getSportVisionUser(),
                }
                await this.infoUseCase.createInfo(infoRequest);
                let cotisation = user.cotisations[0];
                cotisation.generated = true;
                await this.cotisationUseCase.updateCotisation(cotisation.id, cotisation);
            }
        } catch (error: any) {
            throw new Error("Erreur lors de la génération des cartes: " + error.message);
        }
    }

    async generateCotisationCardFromUser(userId: number): Promise<void> {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error("Utilisateur inconnu");
            }
            const card = await this.createMembershipCard(user);
            await this.saveMembershipCard(card, user);
            await this.sendMembershipCardNotification(user);
            let infoRequest: CreateInfoRequest = {
                type: InfoType.CREATE_CARD,
                level: InfoLevel.LOW,
                text: `La carte adhérente de ${user.firstname} ${user.lastname} [${user.id}] a bien été générée`,
                user: await this.getSportVisionUser(),
            }
            await this.infoUseCase.createInfo(infoRequest);
        } catch (error: any) {
            throw new Error("Erreur lors de la génération des cartes: " + error.message);
        }
    }

    private async createMembershipCard(user: User): Promise<Buffer> {
        const {createCanvas, loadImage} = require('canvas');
        const canvas = createCanvas(400, 250);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Texte
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.fillText(`Nom: ${user.firstname} ${user.lastname}`, 50, 50);
        ctx.fillText(`Matricule: ${user.matricule}`, 50, 100);
        ctx.fillText(`Email: ${user.email}`, 50, 150);

        // Logo
        const logo = await loadImage('/Users/ethan/Documents/dev/projetannuel/src/documents/logo.png');
        ctx.drawImage(logo, 300, 10, 80, 80);

        return canvas.toBuffer();
    }

    private async saveMembershipCard(card: Buffer, user: User): Promise<void> {
        const documentUseCase = new DocumentUseCase(AppDataSource);
        const file = {
            buffer: card,
            originalname: `membership_card_${user.matricule}.png`,
            mimetype: 'image/png'
        };

        await documentUseCase.uploadToFolderFromBuffer(user.folders[0].id, file, user.id);
    }

    private async sendMembershipCardNotification(user: User): Promise<void> {
        const messageUseCase = new MessageUseCase(this.db);
        await messageUseCase.sendMessage(MessageType.CARD_CREATED, user, null);
    }

    async getEmailByUserId(userId: number): Promise<Email[]> {
        const user = await this.getUserById(userId);
        const emailUseCase = new EmailUseCase(AppDataSource);

        if (!user) {
            throw new Error("Utilisateur inconnu");
        }

        const result = await emailUseCase.getEmailsByUser(user);
        if (!result) {
            throw new Error("Utilisateur inconnu");
        }
        return result;
    }

    async reactivateUserById(userId: number): Promise<void> {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error("Utilisateur inconnu");
        }
        user.deleted = false;

        await this.userRepository.save(user);
        await this.messageUseCase.sendMessage(MessageType.USER_REACTIVATE, user, user);

        let infoRequest: CreateInfoRequest = {
            type: InfoType.USER_REACTIVATE,
            level: InfoLevel.LOW,
            text: `Utilisateur ${user.firstname} ${user.lastname} [${user.id}] a bien été réactivé`,
            user: user
        }
        await this.infoUseCase.createInfo(infoRequest);
    }

    async escapeHtml(unsafe: string): Promise<string> {
        return unsafe.replace(/[&<"'>]/g, function (match) {
            const escapeChars: { [key: string]: string } = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return escapeChars[match];
        });
    }

    async lostPassword(email: string): Promise<void> {
        const user = await this.getUserByEmail(email);
        if (!user) {
            throw new Error("Utilisateur inconnu");
        }
        const tmpPassword = await this.generateTemporaryPassword();
        user.firstConnection = false;
        user.password = await this.hashPassword(tmpPassword);
        await this.userRepository.save(user);
        await this.messageUseCase.sendMessage(MessageType.LOST_PASSWORD, user, tmpPassword);

        let infoRequest: CreateInfoRequest = {
            type: InfoType.USER_ASK_CHANGE_PASSWORD,
            level: InfoLevel.HIGH,
            text: `utilisateur ${user.firstname} ${user.lastname} [${user.id}] a demander un changement de mot de passe`,
            user: user
        }
        await this.infoUseCase.createInfo(infoRequest);
    }

    async modifyUserProfilePicture(userId: number, file: Express.Multer.File): Promise<void> {
        try {
            const imageUseCase = new ImageUseCase(AppDataSource);
            let user = await this.getUserById(userId);
            if (!user) {
                throw new Error("Utilisateur inconnu");
            }

            if (user.image) {
                //await imageUseCase.deleteImage(user.image.id);
            }

            const image = await imageUseCase.createImage(file);

            if (!image || image == null) {
                throw new Error("Image impossible a uploader");
            }
            // @ts-ignore
            user.image = image;
            await this.userRepository.save(user);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}





  