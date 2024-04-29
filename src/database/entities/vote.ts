import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import "reflect-metadata"
import { number } from 'joi'
import { User } from './useraccount'

@Entity()
export class Vote {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Description!: string
    @Column() Timeat!: Date
    @Column() Creation_Date!: Date
    @ManyToMany(() => User)
    @JoinTable()
    Users!: User[];

   
    constructor(id?:number,description? : string, timeat?: Date,creation_date?: Date,users?: User[] ) {
       if(id) this.Id = id;
       if(description) this.Description = description;
       if(timeat) this.Timeat = timeat;
       if(creation_date) this.Creation_Date = creation_date;
       if(users) this.Users = users
    }
}
