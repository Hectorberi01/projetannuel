import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import { User } from "./useraccount";
import { Question } from './question';

@Entity()
export class Sondage {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    startDate!: Date

    @Column()
    endDate!: Date

    @Column()
    createdAt!: Date

    @Column()
    createdBy!: User

    @Column()
    @OneToMany(() => Question, question => question.sondage)
    questions!: Question[];


    constructor(id?: number, name?: string, startDate?: Date, endDate?: Date, createdAt?: Date, createdBy?: User, questions?: Question[]) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
        if (createdAt) this.createdAt = createdAt;
        if (createdBy) this.createdBy = createdBy;
        if (questions) this.questions = questions;
    }
}