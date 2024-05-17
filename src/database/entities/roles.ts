import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import "reflect-metadata"
import { User } from './useraccount';

@Entity()
export class Roles {
    @PrimaryGeneratedColumn() 
    Id!: number

    @Column()
    Role!: string

    @ManyToMany(() => User, user => user.roles)
    @JoinTable()
    User!: User;


    constructor(
        id?: number,
        role?: string,
        user?: User
    ) 
    {
        if (id) this.Id = id;
        if(role) this.Role = role;
        if(user) this.User = user
    }
}
