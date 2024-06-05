import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import "reflect-metadata"
import { Sport } from './sport'
import { Player } from './player'
import { Events } from './events'

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

    @Column()
    idImage!: number

    @OneToMany(() => Player, player => player.FormationCenter)
    players!: Player[];

    @ManyToMany(() => Events, event => event.trainingCenters)
    events!: Events[];

    constructor(id?: number, name?: string, address?: string, sport?: Sport[], creationDate?: Date, idImage?: number, email?: string) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (address) this.address = address;
        if (email) this.email = email
        if (sport) this.sports = sport;
        if (creationDate) this.createDate = creationDate;
        if (idImage) this.idImage = idImage;
    }
}
