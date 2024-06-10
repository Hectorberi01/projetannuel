import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import "reflect-metadata";
import { Sport } from './sport';
import { FormationCenter } from './formationcenter';
import { User } from './user';

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ nullable: true })
    height!: number;

    @Column({ nullable: true })
    weight!: number;

    @Column({ type: 'date' })
    birthDate!: Date;

    @Column({ type: 'json', nullable: true })
    stats!: string;

    @ManyToOne(() => FormationCenter, formationCenter => formationCenter.players)
    formationCenter!: FormationCenter;

    @ManyToOne(() => Sport, sport => sport.players)
    sport!: Sport;

    @OneToOne(() => User, user => user.player)
    @JoinColumn() // Ajoutez cette ligne pour spécifier la colonne de jointure
    user!: User;

    constructor(id?: number,
                firstName?: string,
                lastName?: string,
                birthDate?: Date,
                formationCenter?: FormationCenter,
                sport?: Sport,
                user?: User,
    ) {
        if (id) this.id = id;
        if (firstName) this.firstName = firstName;
        if (lastName) this.lastName = lastName;
        if (birthDate) this.birthDate = birthDate;
        if (formationCenter) this.formationCenter = formationCenter;
        if (sport) this.sport = sport;
        if (user) this.user = user;
    }
}
