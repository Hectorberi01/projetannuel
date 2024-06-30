import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user";
import {Event} from "./event";
import {EventInvitationStatut} from "../../Enumerators/EventInvitationStatut";

@Entity()
export class EventInvitation {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    status!: EventInvitationStatut;

    @ManyToOne(() => Event, event => event.invitations, {onDelete: 'CASCADE'})
    event!: Event;

    @ManyToOne(() => User, user => user.invitations, {onDelete: 'CASCADE'})
    user!: User;

    constructor(event?: Event, user?: User, status?: EventInvitationStatut) {
        if (event) this.event = event;
        if (user) this.user = user
        if (status) this.status = status;
    }
}