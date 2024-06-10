import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import "reflect-metadata"
import { User } from './user';

@Entity()
export class Role {
    @PrimaryGeneratedColumn() 
    id!: number

    @Column()
    role!: string

    @ManyToMany(() => User, user => user.role)
    @JoinTable()
    users!: User[];


    constructor(
        id?: number,
        role?: string,
        users?: User[]
    ) 
    {
        if (id) this.id = id;
        if(role) this.role = role;
        if (users) this.users = users;
    }
}
