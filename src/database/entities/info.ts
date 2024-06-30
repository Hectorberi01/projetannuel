import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {InfoType} from "../../Enumerators/InfoType";
import {InfoLevel} from "../../Enumerators/InfoLevel";
import {User} from "./user";

@Entity()
export class Info {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    type!: InfoType;

    @Column()
    level!: InfoLevel;

    @Column()
    text!: string;

    @Column()
    date!: Date;

    @ManyToOne(() => User, user => user.infos)
    user!: User;

    constructor(id?: number, type?: InfoType, level?: InfoLevel, text?: string, user?: User, date?: Date) {
        if (id) this.id = id;
        if (type) this.type = type;
        if (level) this.level = level;
        if (text) this.text = text;
        if (user) this.user = user;
        if (date) this.date = date;
    }
}