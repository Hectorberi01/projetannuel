import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'
import { Token } from "./token"
import "reflect-metadata"
import { Roles } from './roles'

@Entity()
export class User {
    @PrimaryGeneratedColumn() Id!: number
    @Column() FirstName!: string
    @Column() LastName!: string
    @Column() Email!: string
    @Column() Birth_Date!: Date
    @Column() Creation_Date! : Date
    @Column() Address!: string
    @ManyToOne(() => Roles, roles => roles.User)
    Roles!: Roles;
    @Column() Id_Image!: number
    @Column({ unique: true }) Matricule!: number
    @Column() Password!: string
    @OneToMany(() => Token, token => token.user)
    tokens!: Token[]

    constructor(id?: number, firstname?: string,lastname?: string,email?: string,birth_date?: Date,date_creation?: Date,adress?: string, role?: Roles,id_image?: number, matricule?: number, password?: string,tokens?: Token[]) {
        if (id) this.Id = id;
        if (firstname) this.FirstName = firstname;
        if(lastname) this.LastName = lastname;
        if(email) this.Email = email;
        if(birth_date) this.Birth_Date = birth_date;
        if(date_creation) this.Creation_Date = date_creation;
        if(adress) this.Address = adress;
        if(role) this.Roles = role;
        if(id_image) this.Id_Image = id_image;
        if(matricule) this.Matricule =matricule;
        if(password) this.Password = password;
        if(tokens) this.tokens = tokens
    }
}
