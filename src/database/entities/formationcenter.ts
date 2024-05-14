import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import "reflect-metadata"
import { Sport } from './sport'
import { Player } from './player'

@Entity()
export class FormationCenter {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Name!: string
    @Column() Adress!: string
    @Column() Email!: string

    @ManyToMany(() => Sport, sport => sport.formationCenters)
    @JoinTable()
    Sports!: Sport[];
    
    @Column() Creation_Date!: Date
    @Column() Id_Image!: number
    @OneToMany(() => Player, player => player.FormationCenter)
    players!: Player[];

    constructor(id?: number,name?:string, adress?: string,sport?: Sport[], creation_date?: Date,id_Image?: number,email?:string) {
        if (id) this.Id = id;
        if(name) this.Name = name;
        if(adress) this.Adress = adress;
        if(email)   this.Email = email
        if(sport) this.Sports = sport;
        if (creation_date) this.Creation_Date = creation_date;
        if(id_Image) this.Id_Image = id_Image;
    }
}
