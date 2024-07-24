import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {EmailStatus} from "../../Enumerators/EmailStatus";
import {User} from "./user";
import {MessageType} from "../../Enumerators/MessageType";

@Entity()
export class Email {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    status!: EmailStatus

    @ManyToOne(() => User, user => user.emails, {onDelete: 'CASCADE'})
    user!: User;

    @Column()
    type!: MessageType;

    @Column({type: 'text', nullable: true})
    text!: string;

    @Column()
    sentDate!: Date

    constructor(id?: number, user?: User, status?: EmailStatus, type?: MessageType, text?: string, sentDate?: Date) {
        if (id) this.id = id;
        if (user) this.user = user;
        if (status) this.status = status;
        if (type) this.type = type;
        if (text) this.text = text;
        if (sentDate) this.sentDate = sentDate;
    }
}