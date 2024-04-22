import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class NewLetter {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Message!: string


    constructor(id?: number,message?: string) {
        if (id) this.Id = id;
        if(message) this.Message = message;
    }
}
