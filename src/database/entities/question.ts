import { Column, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sondage } from "./sondage";
import { Answer } from "./answer";

export class Question {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    text!: string;

    @Column()
    @OneToOne(() => Sondage, sondage => sondage.questions)
    sondage!: Sondage;

    @Column()
    @OneToMany(() => Answer, answer => answer.question)
    answers!: Answer[]

    constructor(id?: number, text?: string, sondage?: Sondage) {
        if (id) this.id = id;
        if (text) this.text = text;
        if (sondage) this.sondage = sondage;
    }
}