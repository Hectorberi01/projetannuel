import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Function {
    @PrimaryGeneratedColumn() Id!: number
    @Column() User_Account_Id!: number
    @Column() Function!: string

    constructor(id?: number,user_account_id?:number, fonction?: string){
        if (id) this.Id = id;
        if(user_account_id) this.User_Account_Id = user_account_id;
        if(fonction) this.Function = fonction;
    }
}
