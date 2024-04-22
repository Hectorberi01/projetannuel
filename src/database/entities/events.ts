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
    @Column() Id_Image!: number

   
    constructor(id?:number,type? : string, place?: string, timeat?: Date, importance?:number,id_image?:number) {
       if(id) this.Id = id;
       if(type) this.Type = type;
       if(place) this.Place = place;
       if(timeat) this.TimeAt = timeat;
       if(importance) this.Importance = importance;
       if(id_image) this.Id_Image = id_image;
    }
}
