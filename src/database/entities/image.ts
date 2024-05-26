import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToMany, ManyToOne } from 'typeorm'
import "reflect-metadata"
import { Player } from './player'
import { User } from './useraccount';
import { Club } from './club';

@Entity()
export class Image {
    @PrimaryGeneratedColumn() 
    Id!: number

    @Column()  
    url!: string;  

    @OneToOne(() => Player, player => player.Image) 
    players!: Player;

    @OneToOne(() => User, user => user.image)
    user!: User;

    @OneToOne(() => Club, club => club.Image)

    club!: Club;

    constructor(
        id?: number, 
        url?: string, 
        players?: Player,
        user?: User,
        club?: Club
    ) 
    {
        if (id) this.Id = id;
        if(url) this.url = url;
        if(players) this.players = players;
        if(user) this.user = user;
        if(club) this.club = club;
    }
}
