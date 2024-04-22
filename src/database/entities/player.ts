import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Token } from "./token"
import "reflect-metadata"

@Entity()
export class Player {
    @PrimaryGeneratedColumn() Id!: number
    @Column() FirstName!: string
    @Column() Lastname!: string
    @Column() Birth_Date!: Date
    @Column() Id_Sport!: number
    @Column() Id_Formationcenter!: number
    @Column() Id_Image!: number


    constructor(id?: number, name?: string,lastname?: string,birth_date?: Date, id_sport?: number,id_formationcenter?: number,id_image?: number) {
        if (id) this.Id = id;
        if (name) this.FirstName = name;
        if(lastname) this.Lastname = lastname;
        if(birth_date) this.Birth_Date = birth_date;
        if(id_sport) this.Id_Sport = id_sport;
        if(id_formationcenter) this.Id_Formationcenter = id_formationcenter;
        if(id_image) this.Id_Image = id_image;
    }
}
