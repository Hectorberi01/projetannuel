import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import "reflect-metadata"
import {Sport} from './sport'
import {Player} from './player'
import {Event} from './event'
import {User} from './user'

@Entity()
export class FormationCenter {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    address!: string

    @Column()
    email!: string

    @ManyToMany(() => Sport, sport => sport.formationCenters)
    @JoinTable()
    sports!: Sport[];

    @Column()
    createDate!: Date

    @OneToMany(() => Player, player => player.formationCenter)
    players!: Player[];

    @ManyToMany(() => Event, event => event.trainingCenters)
    events!: Event[];

    @OneToMany(() => User, user => user.formationCenter)
    users!: User[];

    constructor(id?: number, name?: string, address?: string, sport?: Sport[], creationDate?: Date, email?: string, users?: User[]) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (address) this.address = address;
        if (email) this.email = email
        if (sport) this.sports = sport;
        if (creationDate) this.createDate = creationDate;
        if (users) this.users = users;
    }
}
