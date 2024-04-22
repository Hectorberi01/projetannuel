import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"
import { number } from 'joi'

@Entity()
export class Vote {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Description!: string
    @Column() Timeat!: Date
    @Column() Creation_Date!: Date

   
    constructor(id?:number,description? : string, timeat?: Date,creation_date?: Date ) {
       if(id) this.Id = id;
       if(description) this.Description = description;
       if(timeat) this.Timeat = timeat;
       if(creation_date) this.Creation_Date = creation_date;
    }
}
