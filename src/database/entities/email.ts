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

    constructor(id?: number, user?: User, status?: EmailStatus, type?: MessageType) {
        if (id) this.id = id;
        if (user) this.user = user;
        if (status) this.status = status;
        if (type) this.type = type;
    }

}