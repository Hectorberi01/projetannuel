import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, OneToOne, JoinTable, JoinColumn } from 'typeorm'
import { Token } from "./token"
import "reflect-metadata"
import { Roles } from './roles'
//import { Planning } from './planning'
import { Image } from './image'
import { Events } from './events'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    Id!: number

    @Column() 
    firstname!: string

    @Column() 
    lastname!: string

    @Column({ unique: true }) 
    email!: string

    @Column() 
    birth_date!: Date

    @Column() 
    date_creation! : Date

    @Column() 
    address!: string

    @ManyToMany(() => Roles, roles => roles.User)
    @JoinTable()
    roles!: Roles[];

    @OneToOne(() => Image, image => image.user, { cascade: true })
    @JoinColumn()
    image!: Image;

    @Column({ unique: true }) 
    matricule!: number

    @Column() 
    password!: string

    @OneToMany(() => Token, token => token.user)
    tokens!: Token[]

    // @ManyToMany(() => Planning, planning => planning.users)
    // plannings!: Planning[]
    
    @ManyToMany(() => Events, event => event.participants)
    events!: Events[];

    constructor(id?: number, 
        firstname?: string,
        lastname?: string,
        email?: string,
        birth_date?: Date,
        date_creation?: Date,
        address?: string, 
        role?: Roles[],
        image?: Image, 
        matricule?: number, 
        password?: string,
        tokens?: Token[]
        )
        {
            if (id) this.Id = id;
            if (firstname) this.firstname = firstname;
            if(lastname) this.lastname = lastname;
            if(email) this.email = email;
            if(birth_date) this.birth_date = birth_date;
            if(date_creation) this.date_creation = date_creation;
            if(address) this.address = address;
            if(role) this.roles = role;
            if(image) this.image = image;
            if(matricule) this.matricule =matricule;
            if(password) this.password = password;
            if(tokens) this.tokens = tokens
        }
}
