import {DataSource} from "typeorm";
import {Club} from "../database/entities/club";
import {CreateClubRequest, UpdateClubRequest} from "../handlers/validator/club-validator";
import {ImageUseCase} from "./image-usecase";
import {AppDataSource} from "../database/database";
import {SportUseCase} from "./sport-usecase";
import {Sport} from "../database/entities/sport";
import {UseruseCase} from "./user-usecase";
import {Role} from "../Enumerators/Role";
import {User} from "../database/entities/user";


export interface ListClubRequest {
    limit: number;
    page: number;
}

export class ClubUseCase {

    constructor(private readonly db: DataSource) {
    }

    async getAllClubs(listClubs: ListClubRequest): Promise<{ clubs: Club[], total: number }> {
        const query = this.db.getRepository(Club).createQueryBuilder('Club');

        query.skip((listClubs.page - 1) * listClubs.limit);
        query.take(listClubs.limit);

        const [clubs, total] = await query.getManyAndCount();
        return {
            clubs,
            total
        };
    }

    async createClub(clubData: CreateClubRequest, file: Express.Multer.File | undefined): Promise<Club | Error> {
        const clubRepository = this.db.getRepository(Club);
        const imageUseCase = new ImageUseCase(AppDataSource);
        const sportUseCase = new SportUseCase(AppDataSource);
        const userUseCase = new UseruseCase(AppDataSource);
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
                // @ts-ignore
                club.image = uploadedImage;
            }
        }
        const result = await clubRepository.save(club);

        if (!result) {
            throw new Error("Erreur lors de la création de ce club");
        }

        await userUseCase.createEntityUser(club, Role.ADMIN_CLUB);
        return result;

    }

    async getClubById(clubId: number): Promise<Club> {
        const clubRepository = this.db.getRepository(Club);

        const club = await clubRepository.findOne({
            where: {id: clubId},
            relations: {
                sports: true,
                image: true,
            }
        });

        if (!club) {
            throw new Error(`Club with id ${clubId} not found`);
        }
        return club;
    }

    async deleteClub(clubId: number) {

        const clubrepository = this.db.getRepository(Club);
        const club = await this.getClubById(clubId);

        if (!club) {
            throw new Error(`${clubId} not found`);
        }

        return await clubrepository.delete(clubId);
    }

    async updateClub(clubId: number, clubData: UpdateClubRequest) {
        const clubRepository = this.db.getRepository(Club);
        const club = await this.getClubById(clubId);

        if (!club || club.id != clubData.id) {
            throw new Error(`${clubId} not found or not correspond`);
        }

        if (clubData.email && club.email != clubData.email) club.email = clubData.email;
        if (clubData.address && club.address != clubData.address) club.address = clubData.address;
        if (clubData.name && club.name != clubData.name) club.name = clubData.name;
        if (clubData.sports && club.sports != clubData.sports) club.sports = clubData.sports;
        if (clubData.events && club.events != clubData.events) club.events = clubData.events;

        return await clubRepository.update(clubId, club);
    }

    async getAllClubUsers(clubId: number): Promise<User[]> {
        const userUseCase = new UseruseCase(AppDataSource)
        const club = await this.getClubById(clubId);
        if (!club) {
            throw new Error(`${clubId} not found`);
        }
        return await userUseCase.getAllClubUsers(club);
    }
}