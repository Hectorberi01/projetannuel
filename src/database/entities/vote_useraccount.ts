import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Vote_UserAccount {
    @PrimaryGeneratedColumn() UserAccount_Id!: number
    @Column() Id_Vote!: number


    constructor(useraccount_id?: number,id_vote?: number) {
        if (useraccount_id) this.UserAccount_Id = useraccount_id;
        if(id_vote) this.Id_Vote = id_vote;
    }
}
