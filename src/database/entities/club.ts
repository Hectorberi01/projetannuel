import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Club {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Name!: string
    @Column() Adress!: string
    @Column() Sport_Id!: number
    @Column() Id_Image! : number
    @Column() creation_date!:Date

    constructor(id?: number, name?: string,adress?: string, sport_id?: number,id_image?: number, creation_date?: Date) {
        if (id) this.Id = id;
        if (name) this.Name = name;
        if(adress) this.Adress = adress;
        if(sport_id) this.Sport_Id = sport_id;
        if(id_image) this.Id_Image = id_image;
        if(creation_date) this.creation_date = creation_date;
    }
}
