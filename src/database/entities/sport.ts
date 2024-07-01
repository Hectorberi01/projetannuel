import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import "reflect-metadata"
import {Player} from './player';
import {FormationCenter} from './formationcenter';
import {PlayerProposal} from "./playerproposal";

@Entity()
export class Sport {
    @PrimaryGeneratedColumn() id!: number

    @Column() name!: string

    @OneToMany(() => Player, player => player.sport)
    players!: Player[];

    @ManyToMany(() => FormationCenter, formationCenter => formationCenter.sports)
    formationCenters!: FormationCenter[];

    @OneToMany(type => PlayerProposal, playerProposal => playerProposal.formationCenter)
    playerProposals!: PlayerProposal[];

    constructor(id?: number, name?: string, playerProposals?: PlayerProposal[]) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (playerProposals) this.playerProposals = playerProposals;
    }
}
