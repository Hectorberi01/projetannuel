import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import "reflect-metadata"
import { number } from 'joi'
import { User } from './useraccount';
import { Club } from './club';
import { FormationCenter } from './formationcenter';

@Entity()
export class Events {
    @PrimaryGeneratedColumn()
    Id!: number

    @Column()
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column()
    location!: string;

    @Column({ nullable: true })
    type!: string;

    @Column({ nullable: true })
    recurrence!: string;

    @Column({ nullable: true })
    capacity!: number;


    @ManyToMany(() => User, user => user.events)
    @JoinTable()
    participants!: User[];

    @ManyToMany(() => Club, club => club.events)
    @JoinTable()
    clubs!: Club[];

    @ManyToMany(() => FormationCenter, trainingCenter => trainingCenter.events)
    @JoinTable()
    trainingCenters!: FormationCenter[];



    constructor(
        id?: number,
        title?: string,
        description?: string,
        startDate?: Date,
        endDate?: Date,
        recurrence?: string,
        location?: string,
        capacity?: number,
        type?: string,
        participants?: User[],
    ) {
        if (id) this.Id = id;
        if (title) this.title = title;
        if (description) this.description = description;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
        if (recurrence) this.recurrence = recurrence;
        if (location) this.location = location;
        if (capacity) this.capacity = capacity;
        if (type) this.type = type;
        if (participants) this.participants = participants;

    }
}
