import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {FormationCenter} from "./formationcenter";
import {Sport} from "./sport";


@Entity()
export class PlayerProposal {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    birthDate!: Date;

    @Column()
    email!: string;

    @Column()
    height!: number;

    @Column()
    weight!: number;

    @ManyToOne(() => FormationCenter, formationCenter => formationCenter.playerProposals)
    formationCenter!: FormationCenter;

    @ManyToOne(() => Sport, sport => sport.playerProposals)
    sport!: Sport

    constructor(id?: number, firstName?: string, lastName?: string, birthDate?: Date, formationCenter?: FormationCenter, sport?: Sport, height?: number, weight?: number) {
        if (id) this.id = id;
        if (firstName) this.firstName = firstName;
        if (lastName) this.lastName = lastName;
        if (birthDate) this.birthDate = birthDate;
        if (formationCenter) this.formationCenter = formationCenter;
        if (sport) this.sport = sport;
        if (weight) this.weight = weight;
        if (height) this.height = height;
    }
}