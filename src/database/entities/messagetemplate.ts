import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class MessageTemplate {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    type!: string;

    @Column()
    subject!: string;

    @Column('text')
    body!: string;

    constructor(type?: string, subject?: string, body?: string) {
        if (type) this.type = type;
        if (subject) this.subject = subject;
        if (body) this.body = body;
    }
}
