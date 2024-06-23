import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {User} from './user';
import {Club} from './club';
import {FormationCenter} from './formationcenter';
import {EventInvitation} from "./eventinvitation";
import {EventStatut} from "../../Enumerators/EventStatut";

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({type: 'text', nullable: true})
    description!: string;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column()
    lieu!: string;

    @Column({nullable: true})
    type!: string;

    @Column({nullable: true})
    statut!: EventStatut;

    @ManyToMany(() => User, user => user.events)
    @JoinTable()
    participants!: User[];

    @ManyToMany(() => Club, club => club.events)
    @JoinTable()
    clubs!: Club[];

    @ManyToMany(() => FormationCenter, trainingCenter => trainingCenter.events)
    @JoinTable()
    trainingCenters!: FormationCenter[];

    @OneToMany(() => EventInvitation, invitation => invitation.event)
    invitations!: EventInvitation[];

    constructor(
        id?: number,
        title?: string,
        description?: string,
        startDate?: Date,
        endDate?: Date,
        lieu?: string,
        type?: string,
        statut?: EventStatut,
        participants?: User[],
        clubs?: Club[],
        trainingCenters?: FormationCenter[],
        invitations?: EventInvitation[]
    ) {
        if (id) this.id = id;
        if (title) this.title = title;
        if (description) this.description = description;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
        if (lieu) this.lieu = lieu;
        if (type) this.type = type;
        if (statut) this.statut = statut;
        if (participants) this.participants = participants;
        if (clubs) this.clubs = clubs;
        if (trainingCenters) this.trainingCenters = trainingCenters;
        if (invitations) this.invitations = invitations;
    }
}
