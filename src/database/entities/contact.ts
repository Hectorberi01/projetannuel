import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {options} from "joi";

@Entity()
export class Contact {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    role!: string;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column()
    subject!: string;

    @Column()
    sentAt!: Date;

    @Column()
    content!: string;

    constructor(id?: number, role?: string, name?: string, email?: string, subject?: string, content?: string, sentAt?: Date) {

        if (id) this.id = id;
        if (role) this.role = role;
        if (name) this.name = name;
        if (email) this.email = email;
        if (subject) this.subject = subject;
        if (content) this.content = content;
        if (sentAt) this.sentAt = sentAt;
    }
}