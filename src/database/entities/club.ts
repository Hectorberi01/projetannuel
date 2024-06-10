import {Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Sport} from './sport';
import {Event} from './event';
import {User} from './user';
import {Image} from './image';

@Entity()
export class Club {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    address!: string;

    @Column()
    email!: string;

    @ManyToMany(() => Sport)
    @JoinTable()
    sports!: Sport[];

    @Column()
    creationDate!: Date;

    @ManyToMany(() => Event, event => event.clubs)
    events!: Event[];

    @OneToMany(() => User, user => user.club)
    users!: User[];

    @OneToOne(() => Image, image => image.club)
    @JoinColumn()
    image!: Image;

    constructor(
        id?: number,
        name?: string,
        address?: string,
        sport?: Sport[],
        creationDate?: Date,
        email?: string,
        events?: Event[],
        users?: User[],
        image?: Image,
    ) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (address) this.address = address;
        if (sport) this.sports = sport;
        if (creationDate) this.creationDate = creationDate;
        if (email) this.email = email;
        if (events) this.events = events;
        if (users) this.users = users;
        if (image) this.image = image;
    }
}