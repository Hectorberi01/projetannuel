import {DataSource} from "typeorm";
import {Club} from "../database/entities/club";
import {CreateClubRequest, UpdateClubRequest} from "../handlers/validator/club-validator";
import {ImageUseCase} from "./image-usecase";
import {AppDataSource} from "../database/database";


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
        let club = new Club();
        club.creationDate = new Date();
        club.email = clubData.email;
        club.address = clubData.address;
        club.name = clubData.name;
        club.events = [];
        club.sports = clubData.sports;

        if (file != null) {
            const uploadedImage = await imageUseCase.createImage(file);
            if (uploadedImage != null) {
                // @ts-ignore
                club.image = uploadedImage;
            }
        }
        return clubRepository.save(club);
    }

    async getClubById(clubId: number): Promise<Club> {
        const clubRepository = this.db.getRepository(Club);

        const club = await clubRepository.findOne({
            where: {id: clubId},
            relations: {
                sports: true
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
}