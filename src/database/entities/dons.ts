import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Dons {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Date!:Date
    @Column() Amount!: number
    @Column() Transaction_Id!: number
    @Column() Transaction_Status!: string
    @Column() Transaction_Type!: string
    @Column() Payment_Method!: string
    @Column() Creation_Date!: Date
    @Column() Receipt_Number!: number
    @Column() Payer_Id!: number
    @Column() Comments!: string
    @Column() Ip_Adresse!: string

    constructor(id?:number,date?:Date,amount?:number,transaction_id?:number,transaction_status?:string,transaction_type?:string,payment_method?:string
    ,creation_date?:Date,receipt_number?:number,payer_id?:number,comments?:string,ip_adresse?:string) 
    {
       if(id) this.Id = id;
       if(date) this.Date = date;
       if(amount) this.Amount = amount;
       if(transaction_id) this.Transaction_Id = transaction_id;
       if(transaction_status) this.Transaction_Status = transaction_status;
       if(transaction_type) this.Transaction_Type = transaction_type;
       if(payment_method) this.Payment_Method;
       if(creation_date) this.Creation_Date = creation_date;
       if(receipt_number) this.Receipt_Number = receipt_number;
       if(payer_id) this.Payer_Id = payer_id;
       if(comments) this.Comments = comments;
       if(ip_adresse) this.Ip_Adresse = ip_adresse;
    }
}
