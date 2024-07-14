// Image Entity
import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user";
import {Player} from "./player";
import {Club} from "./club";
import {FormationCenter} from "./formationcenter";

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    extension!: string;

    @Column()
    path!: string;

    @OneToOne(() => User, user => user.image)
    @JoinColumn()
    user!: User;

    @ManyToOne(() => Player, player => player.image)
    @JoinColumn()
    player!: Player;

    @OneToOne(() => Club, club => club.image)
    @JoinColumn()
    club!: Club;

    @OneToOne(() => FormationCenter, fc => fc.image)
    @JoinColumn()
    fc!: FormationCenter;

    constructor(id?: number, name?: string, extension?: string, path?: string, user?: User, player?: Player, club?: Club, fc?: FormationCenter) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (extension) this.extension = extension;
        if (path) this.path = path;
        if (user) this.user = user;
        if (player) this.player = player;
        if (club) this.club = club;
        if (fc) this.fc = fc;
    }
}
