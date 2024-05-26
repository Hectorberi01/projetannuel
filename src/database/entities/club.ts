import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, OneToOne, JoinColumn } from 'typeorm'
import "reflect-metadata"
import { Sport } from './sport'
import { Events } from './events'
import { Image } from './image'

@Entity()
export class Club {
    @PrimaryGeneratedColumn() 
    Id!: number

    @Column() 
    Name!: string

    @Column() 
    Address!: string

    @Column()
    Email!: string

    @ManyToMany(() => Sport)
    @JoinTable()
    Sports!: Sport[];

    @Column() 
    creation_date!:Date

    @ManyToMany(() => Events, event => event.clubs)
    events!: Events[];

    @OneToOne(() => Image, image => image.club, { cascade: true })
    @JoinColumn()
    Image!: Image;

    constructor(
        id?: number, 
        name?: string,
        address?: string, 
        sport?: Sport[],
        image?: Image, 
        creation_date?: Date,
        email?: string
    ) 
    {
        if (id) this.Id = id;
        if (name) this.Name = name;
        if(address) this.Address = address;
        if(sport) this.Sports = sport;
        if(image) this.Image = image;
        if(creation_date) this.creation_date = creation_date;
        if(email) this.Email = email
    }
}
