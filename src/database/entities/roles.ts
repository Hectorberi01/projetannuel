import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Roles {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Role!: string


    constructor(id?: number,role?: string) {
        if (id) this.Id = id;
        if(role) this.Role = role;
    }
}
