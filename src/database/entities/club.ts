import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import "reflect-metadata"
import {Sport} from './sport'
import {Event} from './event'
import { User } from './user'

@Entity()
export class Club {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    address!: string

    @Column()
    email!: string

    @ManyToMany(() => Sport)
    @JoinTable()
    sports!: Sport[];

    @Column()
    creationDate!: Date

    @ManyToMany(() => Event, event => event.clubs)
    events!: Event[];

    @OneToMany(() => User, user => user.club)
    users!: User[];

    constructor(
        id?: number,
        name?: string,
        address?: string,
        sport?: Sport[],
        creation_date?: Date,
        email?: string,
        events?: Event[],
        users?: User[],
    ) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (address) this.address = address;
        if (sport) this.sports = sport;
        if (creation_date) this.creationDate = creation_date;
        if (email) this.email = email;
        if (events) this.events = events;
        if (users) this.users = users;
    }
}
