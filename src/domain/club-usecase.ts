import {DataSource, Repository} from "typeorm";
import {Club} from "../database/entities/club";
import {CreateClubRequest, UpdateClubRequest} from "../handlers/validator/club-validator";
import {Sport} from "../database/entities/sport";
import {User} from "../database/entities/user";
import {CreateInfoRequest} from "../handlers/validator/info-validator";
import {InfoType} from "../Enumerators/InfoType";
import {InfoLevel} from "../Enumerators/InfoLevel";
import {EntityType} from "../Enumerators/EntityType";
import {Role} from "../Enumerators/Role";

export interface ListClubRequest {
    limit: number;
    page: number;
}

export class ClubUseCase {

    private clubRepository: Repository<Club>;

    constructor(private readonly db: DataSource) {
        this.clubRepository = this.db.getRepository(Club);
    }

    private getImageUseCase() {
        const {ImageUseCase} = require("./image-usecase");
        return new ImageUseCase(this.db);
    }

    private getCotisationUseCase() {
        const {CotisationUseCase} = require("./cotisation-usecase");
        return new CotisationUseCase(this.db);
    }

    private getSportUseCase() {
        const {SportUseCase} = require("./sport-usecase");
        return new SportUseCase(this.db);
    }

    private getUserUseCase() {
        const {UseruseCase} = require("./user-usecase");
        return new UseruseCase(this.db);
    }

    private getInfoUseCase() {
        const {InfoUseCase} = require("./info-usecase");
        return new InfoUseCase(this.db);
    }

    async getAllClubs(listClubs: ListClubRequest): Promise<{ clubs: Club[], total: number }> {
        const query = this.clubRepository.createQueryBuilder('Club');
        query.skip((listClubs.page - 1) * listClubs.limit);
        query.take(listClubs.limit);
        const [clubs, total] = await query.getManyAndCount();
        return {clubs, total};
    }

    async createClub(clubData: CreateClubRequest, file: Express.Multer.File | undefined): Promise<Club | Error> {
        const sportUseCase = this.getSportUseCase();
        const imageUseCase = this.getImageUseCase();
        const userUseCase = this.getUserUseCase();
        const cotisationUseCase = this.getCotisationUseCase();
        const infoUseCase = this.getInfoUseCase();

        let club = new Club();
        club.creationDate = new Date();
        club.email = clubData.email;
        club.address = clubData.address;
        club.name = clubData.name;
        club.events = [];

        let sports: Sport[] = [];
        const sportsIds = JSON.parse(clubData.sports) as number[];
        if (sportsIds != null && sportsIds.length > 0) {
            for (let id of sportsIds) {
                const sport = await sportUseCase.getSportById(id);
                if (sport != null) {
                    sports.push(sport);
                }
            }
        }
        if (sports.length > 0) {
            club.sports = sports;
        }

        if (file != null) {
            const uploadedImage = await imageUseCase.createImage(file);
            if (uploadedImage != null) {
                club.image = uploadedImage;
            }
        }

        const result = await this.clubRepository.save(club);
        if (!result) {
            throw new Error("Erreur lors de la création de ce club");
        }

        await userUseCase.createEntityUser(club, Role.ADMIN_CLUB);
        await cotisationUseCase.createCotisation(EntityType.CLUB, result.id);

        const infoRequest: CreateInfoRequest = {
            type: InfoType.CLUB_CREATE,
            level: InfoLevel.LOW,
            text: `Le club ${club.name} [${club.id}] a été créé`,
            user: await userUseCase.getSportVisionUser()
        };
        await infoUseCase.createInfo(infoRequest);

        return result;
    }

    async getClubById(clubId: number): Promise<Club> {
        const club = await this.clubRepository.findOne({
            where: {id: clubId},
            relations: {sports: true, image: true, users: true}
        });
        if (!club) {
            throw new Error(`Club with id ${clubId} not found`);
        }
        return club;
    }

    async deleteClub(clubId: number) {
        const club = await this.getClubById(clubId);
        if (!club) {
            throw new Error(`${clubId} not found`);
        }

        const result = await this.clubRepository.delete(clubId);
        const infoUseCase = this.getInfoUseCase();
        const userUseCase = this.getUserUseCase();
        const infoRequest: CreateInfoRequest = {
            type: InfoType.CLUB_DELETE,
            level: InfoLevel.MODERATE,
            text: `Club ${club.name} [${club.id}] a bien été supprimé`,
            user: await userUseCase.getSportVisionUser()
        };
        await infoUseCase.createInfo(infoRequest);

        return result;
    }

    async updateClub(clubId: number, clubData: UpdateClubRequest) {
        const club = await this.getClubById(clubId);
        if (!club || club.id != clubData.id) {
            throw new Error(`${clubId} not found or not correspond`);
        }

        if (clubData.email && club.email != clubData.email) club.email = clubData.email;
        if (clubData.address && club.address != clubData.address) club.address = clubData.address;
        if (clubData.name && club.name != clubData.name) club.name = clubData.name;
        if (clubData.sports && club.sports != clubData.sports) club.sports = clubData.sports;
        if (clubData.events && club.events != clubData.events) club.events = clubData.events;

        const result = await this.clubRepository.save(club);
        const infoUseCase = this.getInfoUseCase();
        const userUseCase = this.getUserUseCase();
        const infoRequest: CreateInfoRequest = {
            type: InfoType.CLUB_UPDATE,
            level: InfoLevel.MODERATE,
            text: `Club ${club.name} [${club.id}] a bien été mis à jour`,
            user: await userUseCase.getSportVisionUser()
        };
        await infoUseCase.createInfo(infoRequest);

        return result;
    }

    async getAllClubUsers(clubId: number): Promise<User[]> {
        const club = await this.getClubById(clubId);
        if (!club) {
            throw new Error(`${clubId} not found`);
        }
        const userUseCase = this.getUserUseCase();
        return await userUseCase.getAllClubUsers(club);
    }
}
