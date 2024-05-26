import { Column, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./useraccount";
import { Question } from "./question";

export class Answer {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @OneToOne(() => Question, question => question.answers)
    question!: Question;

    @Column()
    user!: User

    constructor(id?: number, question?: Question, user?: User) {
        if (id) this.id = id;
        if (question) this.question = question;
        if (user) this.user = user;
    }
}