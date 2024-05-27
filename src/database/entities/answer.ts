import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./useraccount";
import { Question } from "./question";
import { Sondage } from "./sondage";

@Entity()
export class Answer {

    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => Question, question => question.answers)
    question!: Question;

    @ManyToOne(() => User, user => user.answers)
    user!: User

    @ManyToOne(() => Sondage, sondage => sondage.answers)
    sondage!: Sondage

    @Column()
    createdAt!: Date

    constructor(id?: number, question?: Question, user?: User, sondage?: Sondage, createdAt?: Date) {
        if (id) this.id = id;
        if (question) this.question = question;
        if (user) this.user = user;
        if (sondage) this.sondage = sondage
        if (createdAt) this.createdAt = createdAt;
    }
}