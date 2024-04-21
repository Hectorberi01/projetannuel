import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"
import { number } from 'joi'

@Entity()
export class Events {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Type!: string
    @Column() Place!: string
    @Column() TimeAt!: Date
    @Column() Importance!: number

   
    constructor(id?:number,type? : string, place?: string, timeat?: Date, importance?:number) {
       if(id) this.Id = id;
       if(type) this.Type = type;
       if(place) this.Place = place;
       if(timeat) this.TimeAt = timeat;
       if(importance) this.Importance = importance;
    }
}
