import { DataSource } from "typeorm";
import express, { Request, Response} from "express";
import { AppDataSource } from "../database/database";
import { Dons } from "../database/entities/dons";

export interface ListDonsCase {
    limit: number;
    page: number;
}

export class Donsusecase{
    
    constructor(private readonly db: DataSource){}

    /** List des dons cette fonction prends en paramètre ListDonsCase 
     * et return  la liste des dons
     */
    async ListeDont(listdons: ListDonsCase): Promise<{dons: Dons[], total: number}>{    
        const query = this.db.getRepository(Dons).createQueryBuilder('dons');
        query.skip((listdons.page - 1) * listdons.limit);
        query.take(listdons.limit);
        const [dons, total] = await query.getManyAndCount();
        return {dons,total};
    }

    /** création des */
}