import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    lastname: string

    @Column()
    email: string

    @Column()
    adress: string

    @Column()
    age: number

    @Column()
    password: string

    @Column({ unique: true })
    matricule: number

    @Column()
    role: string

    @Column()
    anciennete: number

    constructor(id: number, name: string,lastname: string,email: string,adress: string, age: number, password: string, matricule: number, role: string, anciennete: number) {
        this.id = id;
        this.name = name;
        this.lastname = lastname;
        this.email = email;
        this.adress = adress;
        this.age = age;
        this.password = password;
        this.matricule =matricule;
        this.role = role;
        this.anciennete = anciennete
    }
}
