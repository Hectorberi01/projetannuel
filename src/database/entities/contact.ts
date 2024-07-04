import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Contact {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    role!: string;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column()
    subject!: string;

    @Column()
    content!: string;

    constructor(id?: number, role?: string, name?: string, email?: string, subject?: string, content?: string) {

        if (id) this.id = id;
        if (role) this.role = role;
        if (name) this.name = name;
        if (email) this.email = email;
        if (subject) this.subject = subject;
        if (content) this.content = content;
    }
}