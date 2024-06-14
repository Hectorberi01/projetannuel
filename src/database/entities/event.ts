import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user';
import { Club } from './club';
import { FormationCenter } from './formationcenter';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column()
    lieu!: string;

    @Column({ nullable: true })
    type!: string;

    @Column({ nullable: true })
    recurrence!: string;

    @Column({ nullable: true })
    activity!: string;

    @Column({ nullable: true })
    capacity!: number;

    @Column({ nullable: true })
    statut!: string;

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
        lieu?: string,
        capacity?: number,
        type?: string,
        statut?: string,
        activity?: string,
        participants?: User[],
        clubs?: Club[],
        trainingCenters?: FormationCenter[]
    ) {
        if (id) this.id = id;
        if (title) this.title = title;
        if (description) this.description = description;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
        if (recurrence) this.recurrence = recurrence;
        if (lieu) this.lieu = lieu;
        if (capacity) this.capacity = capacity;
        if (type) this.type = type;
        if (statut) this.statut = statut;
        if (activity) this.activity = activity;
        if (participants) this.participants = participants;
        if (clubs) this.clubs = clubs;
        if (trainingCenters) this.trainingCenters = trainingCenters;
    }
}
