import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import "reflect-metadata"
import { Sport } from './sport'

@Entity()
export class FormationCenter {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Name!: string
    @Column() Adress!: string
    @ManyToMany(() => Sport)
    @JoinTable()
    Sports!: Sport[];
    @Column() Creation_Date!: Date
    @Column() Id_Image!: number

    constructor(id?: number,name?:string, adress?: string,sport?: Sport[], creation_date?: Date,id_Image?: number) {
        if (id) this.Id = id;
        if(name) this.Name = name;
        if(adress) this.Adress = adress;
        if(sport) this.Sports = sport;
        if (creation_date) this.Creation_Date = creation_date;
        if(id_Image) this.Id_Image = id_Image;
    }
}
