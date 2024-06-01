import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, OneToOne, JoinColumn } from 'typeorm';
import { Token } from "./token";
import { Roles } from './roles';
import { Image } from './image';
import { Events } from './events';
import { Answer } from './answer';
import { Sondage } from './sondage';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstname!: string;

    @Column()
    lastname!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    birth_date!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) 
    date_creation! : Date

    @Column()
    address!: string;

    @ManyToMany(() => Roles, roles => roles.User)
    @JoinTable()
    roles!: Roles[];

    @OneToOne(() => Image, image => image.users, { cascade: true })
    @JoinColumn()
    image!: Image;

    @Column({ unique: true })
    matricule!: number;

    @Column()
    password!: string;

    @OneToMany(() => Token, token => token.user)
    tokens!: Token[];

    @OneToMany(() => Answer, answer => answer.user)
    answers!: Answer[];

    @OneToMany(() => Sondage, sondage => sondage.createdBy)
    sondages!: Sondage[];

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
        tokens?: Token[],
        answers?: Answer[],
        sondages?: Sondage[],
    ) {
        if (id) this.id = id;
        if (firstname) this.firstname = firstname;
        if (lastname) this.lastname = lastname;
        if (email) this.email = email;
        if (birth_date) this.birth_date = birth_date;
        if (date_creation) this.date_creation = date_creation;
        if (address) this.address = address;
        if (role) this.roles = role;
        if (image) this.image = image;
        if (matricule) this.matricule = matricule;
        if (password) this.password = password;
        if (tokens) this.tokens = tokens;
        if (answers) this.answers = answers;
        if (sondages) this.sondages = sondages;
    }
}
