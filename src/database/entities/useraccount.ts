import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Token } from "./token"
import "reflect-metadata"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    lastname!: string

    @Column()
    email!: string

    @Column()
    adress!: string

    @Column()
    age!: number

    @Column()
    password!: string

    @Column({ unique: true })
    matricule!: number

    @Column()
    role!: string

    @Column()
    anciennete!: Date

    @OneToMany(() => Token, token => token.user)
    tokens!: Token[]

    constructor(id?: number, name?: string,lastname?: string,email?: string,adress?: string, age?: number, password?: string, matricule?: number, role?: string, anciennete?: Date,tokens?: Token[]) {
        if (id) this.id = id;
        if (name) this.name = name;
        if(lastname) this.lastname = lastname;
        if(email) this.email = email;
        if(adress) this.adress = adress;
        if(age) this.age = age;
        if(password) this.password = password;
        if(matricule) this.matricule =matricule;
        if(role) this.role = role;
        if(anciennete) this.anciennete = anciennete;
        if(tokens) this.tokens = tokens
    }
}
