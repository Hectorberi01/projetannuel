import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Player} from "./player";
import {Club} from "./club";
import {FormationCenter} from "./formationcenter";
import {User} from "./user";

@Entity()
export class EventProposal {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column()
    place!: string;

    @ManyToOne(type => Player, player => player.eventProposals)
    player!: Player;

    @ManyToOne(type => Club, club => club.eventProposals)
    club!: Club;

    @ManyToOne(type => FormationCenter, formationCenter => formationCenter.eventProposals)
    formationCenter!: FormationCenter;

    @ManyToOne(type => User, user => user.eventProposals)
    createdBy!: User;

    @Column()
    createdAt!: Date;

    constructor(id?: number, title?: string, description?: string, startDate?: Date, endDate?: Date, place?: string, player?: Player, club?: Club, formationCenter?: FormationCenter, createdBy?: User, createdAt?: Date) {
        if (id) this.id = id;
        if (title) this.title = title;
        if (description) this.description = description;
        if (startDate) this.startDate = startDate;
        if (endDate) this.endDate = endDate;
        if (place) this.place = place;
        if (player) this.player = player;
        if (club) this.club = club;
        if (formationCenter) this.formationCenter = formationCenter;
        if (createdBy) this.createdBy = createdBy;
        if (createdAt) this.createdAt = createdAt;
    }
}