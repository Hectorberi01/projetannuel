import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Event_Club {
    @PrimaryGeneratedColumn() Club_Id!: number
    @Column() Id_Event!: number


    constructor(club_id?: number,id_event?: number) {
        if (club_id) this.Club_Id = club_id;
        if(id_event) this.Id_Event = id_event;
    }
}
