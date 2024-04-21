import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Dont {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Date!:Date
    @Column() Amount!: number

   
    constructor() {
       
    }
}
