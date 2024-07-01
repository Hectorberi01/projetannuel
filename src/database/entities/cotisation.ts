import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Transaction} from './transaction'
import {CotisationStatus} from "../../Enumerators/CotisationStatus";
import {User} from "./user";
import {Club} from "./club";
import {FormationCenter} from "./formationcenter";
import {EntityType} from "../../Enumerators/EntityType";

@Entity()
export class Cotisation {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    amount!: number;

    @Column()
    status!: CotisationStatus;

    @Column()
    limitDate!: Date;

    @Column({ nullable: true })
    paymentDate!: Date;

    @OneToOne(type => Transaction, transaction => transaction.cotisation)
    transaction!: Transaction;

    @Column()
    entityType!: EntityType;

    @ManyToOne(type => User, user => user.cotisations)
    @JoinColumn({ name: 'userId' })
    user!: User

    @ManyToOne(type => Club, club => club.cotisations)
    club!: Club

    @ManyToOne(type => FormationCenter, formationCenter => formationCenter.cotisations)
    formationCenter!: FormationCenter;

    constructor(id?: number, amount?: number, status?: CotisationStatus, limitDate?: Date, paymentDate?: Date, transaction?: Transaction, entityType?: EntityType, user?: User, club?: Club, formationCenter?: FormationCenter) {
        if (id) this.id = id;
        if (amount) this.amount = amount;
        if (status) this.status = status;
        if (limitDate) this.limitDate = limitDate;
        if (paymentDate) this.paymentDate = paymentDate;
        if (entityType) this.entityType = entityType;
        if (user) this.user = user;
        if (status) this.status = status;
        if (club) this.club = club;
        if (formationCenter) this.formationCenter = formationCenter;
        if (transaction) this.transaction = transaction;
    }
}