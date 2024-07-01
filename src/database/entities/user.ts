import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Role } from './roles';
import { Event } from './event';
import { Answer } from './answer';
import { Sondage } from './sondage';
import { Club } from './club';
import { FormationCenter } from './formationcenter';
import { Player } from './player';
import { Image } from './image';
import { Exclude } from 'class-transformer';
import { Folder } from './Folder';
import { Document } from './document';
import { EventInvitation } from "./eventinvitation";
import { Email } from "./email";
import { EventProposal } from "./eventProposal";
import { Cotisation } from "./cotisation";
import { Info } from "./info";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstname!: string;

    @Column()
    lastname!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ type: 'timestamp' })
    birthDate!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createDate!: Date;

    @Column()
    address!: string;

    @ManyToOne(() => Role, role => role.users)
    role!: Role;

    @Column({ unique: true })
    matricule!: string;

    @Column()
    @Exclude()
    password!: string;

    @OneToMany(() => Answer, answer => answer.user)
    answers!: Answer[];

    @OneToMany(() => Sondage, sondage => sondage.createdBy)
    sondages!: Sondage[];

    @ManyToMany(() => Event, event => event.participants)
    events!: Event[];

    @Column()
    newsletter!: boolean;

    @Column()
    deleted!: boolean;

    @ManyToOne(() => Club, club => club.users)
    @JoinColumn({ name: 'clubId' })
    club!: Club;

    @ManyToOne(() => FormationCenter, formationCenter => formationCenter.users)
    @JoinColumn({ name: 'formationCenterId' })
    formationCenter!: FormationCenter;

    @OneToOne(() => Player, player => player.user)
    @JoinColumn({ name: 'playerId' })
    player!: Player;

    @OneToOne(() => Image, image => image.user)
    @JoinColumn({ name: 'imageId' })
    image!: Image;

    @Column()
    firstConnection!: boolean;

    @Column({ default: false })
    a2fEnabled!: boolean;

    @Column({ nullable: true })
    a2fCode!: string;

    @Column({ type: 'timestamp', nullable: true })
    a2fCodeCreatedAt!: Date;

    @OneToMany(() => Document, document => document.user)
    documents!: Document[];

    @OneToMany(() => Folder, folder => folder.user)
    folders!: Folder[];

    @OneToMany(() => EventInvitation, invitation => invitation.user)
    invitations!: EventInvitation[];

    @OneToMany(() => Email, email => email.user)
    emails!: Email[];

    @OneToMany(type => EventProposal, eventProposal => eventProposal.club)
    eventProposals!: EventProposal[];

    @OneToMany(type => Cotisation, cotisation => cotisation.user)
    cotisations!: Cotisation[];

    @OneToMany(type => Info, info => info.user)
    infos!: Info[];

    constructor(
        id?: number,
        firstname?: string,
        lastname?: string,
        email?: string,
        birth_date?: Date,
        date_creation?: Date,
        address?: string,
        role?: Role,
        matricule?: string,
        password?: string,
        answers?: Answer[],
        sondages?: Sondage[],
        newsletter?: boolean,
        deleted?: boolean,
        club?: Club,
        formationCenter?: FormationCenter,
        player?: Player,
        image?: Image,
        firstConnection?: boolean,
        a2fEnabled?: boolean,
        a2fCode?: string,
        a2fCodeCreatedAt?: Date,
        folders?: Folder[],
        documents?: Document[],
        invitations?: EventInvitation[],
        emails?: Email[],
        eventsProposals?: EventProposal[],
        cotisations?: Cotisation[],
        infos?: Info[]
    ) {
        if (id) this.id = id;
        if (firstname) this.firstname = firstname;
        if (lastname) this.lastname = lastname;
        if (email) this.email = email;
        if (birth_date) this.birthDate = birth_date;
        if (date_creation) this.createDate = date_creation;
        if (address) this.address = address;
        if (role) this.role = role;
        if (matricule) this.matricule = matricule;
        if (password) this.password = password;
        if (answers) this.answers = answers;
        if (sondages) this.sondages = sondages;
        if (newsletter) this.newsletter = newsletter;
        if (deleted) this.deleted = deleted;
        if (club) this.club = club;
        if (formationCenter) this.formationCenter = formationCenter;
        if (player) this.player = player;
        if (image) this.image = image;
        if (firstConnection) this.firstConnection = firstConnection;
        if (a2fEnabled) this.a2fEnabled = a2fEnabled;
        if (a2fCode) this.a2fCode = a2fCode;
        if (a2fCodeCreatedAt) this.a2fCodeCreatedAt = a2fCodeCreatedAt;
        if (folders) this.folders = folders;
        if (documents) this.documents = documents;
        if (invitations) this.invitations = invitations;
        if (emails) this.emails = emails;
        if (eventsProposals) this.eventProposals = eventsProposals;
        if (cotisations) this.cotisations = cotisations;
        if (infos) this.infos = infos;
    }
}
