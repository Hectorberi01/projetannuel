import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm'
import "reflect-metadata"
import { Player } from './player';
import { FormationCenter } from './formationcenter';

@Entity()
export class Sport {
    @PrimaryGeneratedColumn() Id!: number
    
    @Column() Name!: string

    @OneToMany(() => Player, player => player.Sport)
    players!: Player[];

    @ManyToMany(() => FormationCenter, formationCenter => formationCenter.sports)
    formationCenters!: FormationCenter[];


    constructor(id?: number,name?: string) {
        if (id) this.Id = id;
        if(name) this.Name = name;
    }
}
