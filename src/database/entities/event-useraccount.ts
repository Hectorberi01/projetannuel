import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Event_UserAccount {
    @PrimaryGeneratedColumn() UserAccount_Id!: number
    @Column() Id_Event!: number


    constructor(useraccount_id?: number,id_event?: number) {
        if (useraccount_id) this.UserAccount_Id = useraccount_id;
        if(id_event) this.Id_Event = id_event;
    }
}
