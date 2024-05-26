import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm'
import { Token } from "./token"
import "reflect-metadata"
import { Sport } from './sport'
import { FormationCenter } from './formationcenter'
import {Image} from './image'

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    Id!: number

    @Column() 
    FirstName!: string

    @Column()
    Lastname!: string

    @Column() 
    Height!: number

    @Column() 
    Weight!: number

    @Column({ type: 'date', nullable: true })
    BirthDate!: Date | null; 

    @Column({ type: 'json', nullable: true })
    stats!: object;

    @ManyToOne(() => FormationCenter, formationCenter => formationCenter.players)
    FormationCenter!: FormationCenter;

    @ManyToOne(() => Sport, sport => sport.players)
    Sport!: Sport;

    @OneToOne(() => Image, image => image.players,{ cascade: true })
    @JoinColumn()
    Image!: Image;


    constructor(id?: number,
            name?: string,
            lastname?: string,
            birth_date?: Date,
            formationCenter?: FormationCenter, 
            sport?: Sport,
            image?:Image
        ) 
        {
            if (id) this.Id = id;
            if (name) this.FirstName = name;
            if(lastname) this.Lastname = lastname;
            if(birth_date) this.BirthDate = birth_date;
            if (formationCenter) this.FormationCenter = formationCenter;
            if (sport) this.Sport = sport;
            if(image) this.Image = image
        }
}
