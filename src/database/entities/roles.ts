import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Role {
    @PrimaryGeneratedColumn() Id!: number
    @Column() User_Id!: number
    @Column() Role!: string


    constructor(id?: number,user_id?:number, role?: string) {
        if (id) this.Id = id;
        if(user_id) this.User_Id = user_id;
        if(role) this.Role = role;
    }
}
