import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"
import { User } from './useraccount';

@Entity()
export class Roles {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Role!: string
    @OneToMany(() => User, user => user.Roles)
    User!: User[];


    constructor(id?: number,role?: string) {
        if (id) this.Id = id;
        if(role) this.Role = role;
    }
}
