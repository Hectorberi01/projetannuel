import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Sondage } from './sondage';
import { Answer } from './answer';

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    text!: string;

    @ManyToOne(() => Sondage, sondage => sondage.questions)
    sondage!: Sondage;

    @OneToMany(() => Answer, answer => answer.question)
    answers!: Answer[];

    constructor(id?: number, text?: string, sondage?: Sondage) {
        if (id) this.id = id;
        if (text) this.text = text;
        if (sondage) this.sondage = sondage;
    }
}
