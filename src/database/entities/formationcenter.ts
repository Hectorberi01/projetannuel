import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class FormationCenter {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Name!: string
    @Column() Adress!: string
    @Column() Sport_Id!: number
    @Column() Creation_Date!: Date

    constructor(id?: number,name?:string, adress?: string,sport_id?: number, creation_date?: Date) {
        if (id) this.Id = id;
        if(name) this.Name = name;
        if(adress) this.Adress = adress;
        if(sport_id) this.Sport_Id = sport_id;
        if (creation_date) this.Creation_Date = creation_date;
    }
}
