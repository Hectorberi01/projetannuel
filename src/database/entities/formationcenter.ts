import {Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Sport} from './sport';
import {Player} from './player';
import {Event} from './event';
import {User} from './user';
import {EventProposal} from "./eventProposal";
import {Cotisation} from "./cotisation";
import {PlayerProposal} from "./playerproposal";
import {Image} from "./image"

@Entity()
export class FormationCenter {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    address!: string;

    @Column()
    email!: string;

    @ManyToMany(() => Sport, sport => sport.formationCenters)
    @JoinTable()
    sports!: Sport[];

    @Column()
    createDate!: Date;

    @OneToMany(() => Player, player => player.formationCenter)
    players!: Player[];

    @ManyToMany(() => Event, event => event.trainingCenters)
    events!: Event[];

    @OneToMany(() => User, user => user.formationCenter)
    users!: User[];

    @OneToMany(type => EventProposal, eventProposal => eventProposal.club)
    eventProposals!: EventProposal[];

    @OneToMany(type => Cotisation, cotisation => cotisation.user)
    cotisations!: Cotisation[];

    @OneToMany(type => PlayerProposal, playerProposal => playerProposal.formationCenter)
    playerProposals!: PlayerProposal[];

    @OneToOne(() => Image, image => image.fc)
    image!: Image

    constructor(id?: number, name?: string, address?: string, sport?: Sport[], creationDate?: Date, email?: string, users?: User[], eventProposals?: EventProposal[], cotisations?: Cotisation[], playerProposals?: PlayerProposal[], image?: Image) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (address) this.address = address;
        if (email) this.email = email;
        if (sport) this.sports = sport;
        if (creationDate) this.createDate = creationDate;
        if (users) this.users = users;
        if (eventProposals) this.eventProposals = eventProposals;
        if (cotisations) this.cotisations = cotisations;
        if (playerProposals) this.playerProposals = playerProposals;
        if (image) this.image = image
    }
}
