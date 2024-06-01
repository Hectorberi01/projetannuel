import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from "./useraccount";
import { Question } from './question';
import { Answer } from './answer';

@Entity()
export class Sondage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column()
    createdAt!: Date;

    @ManyToOne(() => User, user => user.sondages)
    createdBy!: User;

    @OneToMany(() => Question, question => question.sondage)
    questions!: Question[];

    @OneToMany(() => Answer, answer => answer.sondage)
    answers!: Answer[];

    constructor(id?: number, name?: string, startDate?: Date, endDate?: Date, createdAt?: Date, createdBy?: User, questions?: Question[], answers?: Answer[]) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
        if (createdAt) this.createdAt = createdAt;
        if (createdBy) this.createdBy = createdBy;
        if (questions) this.questions = questions;
        if (answers) this.answers = answers;
    }
}
