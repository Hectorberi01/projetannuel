import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Sport {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Name!: string


    constructor(id?: number,name?: string) {
        if (id) this.Id = id;
        if(name) this.Name = name;
    }
}
