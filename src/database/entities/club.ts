import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Club {
    @PrimaryGeneratedColumn() id!: number
    @Column() name!: string
    @Column() adress!: string
    @Column() sport_id!: number
    @Column() creation_date!:Date

    constructor(id?: number, name?: string,adress?: string, sport_id?: number, creation_date?: Date) {
        if (id) this.id = id;
        if (name) this.name = name;
        if(adress) this.adress = adress;
        if(sport_id) this.sport_id = sport_id;
        if(creation_date) this.creation_date = creation_date;
    }
}
