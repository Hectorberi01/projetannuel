import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Event_FormationCenter {
    @PrimaryGeneratedColumn() FormationCenter_Id!: number
    @Column() Id_Event!: number


    constructor(formationcenter_id?: number,id_event?: number) {
        if (formationcenter_id) this.FormationCenter_Id = formationcenter_id;
        if(id_event) this.Id_Event = id_event;
    }
}
