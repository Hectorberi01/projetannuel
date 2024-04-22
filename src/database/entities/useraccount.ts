import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Token } from "./token"
import "reflect-metadata"

@Entity()
export class User {
    @PrimaryGeneratedColumn() Id!: number
    @Column() FirstName!: string
    @Column() Lastname!: string
    @Column() Email!: string
    @Column() Birth_Date!: Date
    @Column() Creation_Date! : Date
    @Column() Adress!: string
    @Column() Id_Roles!: number
    @Column() Id_Image!: number
    @Column({ unique: true }) Matricule!: number
    @Column() Password!: string
    @OneToMany(() => Token, token => token.user)
    tokens!: Token[]

    constructor(id?: number, name?: string,lastname?: string,email?: string,birth_date?: Date,date_creation?: Date,adress?: string, id_role?: number,id_image?: number, matricule?: number, password?: string,tokens?: Token[]) {
        if (id) this.Id = id;
        if (name) this.FirstName = name;
        if(lastname) this.Lastname = lastname;
        if(email) this.Email = email;
        if(birth_date) this.Birth_Date = birth_date;
        if(date_creation) this.Creation_Date = date_creation;
        if(adress) this.Adress = adress;
        if(id_role) this.Id_Roles = id_role;
        if(id_image) this.Id_Image = id_image;
        if(matricule) this.Matricule =matricule;
        if(password) this.Password = password;
        if(tokens) this.tokens = tokens
    }
}
