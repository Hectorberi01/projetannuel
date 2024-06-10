import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import "reflect-metadata"
import {Player} from './player';
import {FormationCenter} from './formationcenter';

@Entity()
export class Sport {
    @PrimaryGeneratedColumn() id!: number

    @Column() name!: string

    @OneToMany(() => Player, player => player.sport)
    players!: Player[];

    @ManyToMany(() => FormationCenter, formationCenter => formationCenter.sports)
    formationCenters!: FormationCenter[];


    constructor(id?: number, name?: string) {
        if (id) this.id = id;
        if (name) this.name = name;
    }
}
