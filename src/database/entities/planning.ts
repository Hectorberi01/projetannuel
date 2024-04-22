import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"
import { number } from 'joi'

@Entity()
export class Planning {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Description!: string
    @Column() Date_Debut!: Date
    @Column() Date_Fin!: Date
    @Column() Id_User!: number
   
    constructor(id?:number,description? : string, date_debut?: Date,date_fin?: Date,id_user?:number ) {
       if(id) this.Id = id;
       if(description) this.Description = description;
       if(date_debut) this.Date_Debut = date_debut;
       if(date_fin) this.Date_Fin = date_fin;
       if(id_user) this.Id_User = id_user;
    }
}
