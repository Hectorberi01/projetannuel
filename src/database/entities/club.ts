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
    Adress!: string

    @ManyToMany(() => Sport)
    @JoinTable()
    Sports!: Sport[];

    @Column()
    Id_Image! : number

    @Column() 
    creation_date!:Date

    @ManyToMany(() => Events, event => event.clubs)
    events!: Events[];

    @OneToOne(() => Image, image => image.club, { cascade: true })
    @JoinColumn()
    image!: Image;

    constructor(
        id?: number, 
        name?: string,
        adress?: string, 
        sport?: Sport[],
        id_image?: number, 
        creation_date?: Date
    ) 
    {
        if (id) this.Id = id;
        if (name) this.Name = name;
        if(adress) this.Adress = adress;
        if(sport) this.Sports = sport;
        if(id_image) this.Id_Image = id_image;
        if(creation_date) this.creation_date = creation_date;
    }
}
