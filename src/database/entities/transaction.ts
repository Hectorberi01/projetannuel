import {Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Cotisation} from "./cotisation";
import {TransactionType} from "../../Enumerators/TransactionType";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    orderId!: string;

    @Column()
    status!: string;

    @Column('decimal', {precision: 10, scale: 2})
    amount!: number;

    @Column()
    currency!: string;

    @Column()
    donorName!: string;

    @Column()
    donorEmail!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    type!: TransactionType;

    @OneToOne(() => Cotisation, cotisation => cotisation.transaction)
    cotisation!: Cotisation;

    constructor(id?: number, orderId?: string, status?: string, amount?: number, currency?: string, donorName?: string, donorEmail?: string, createdAt?: Date, cotisation?: Cotisation, type?: TransactionType) {
        if (id) this.id = id;
        if (orderId) this.orderId = orderId;
        if (status) this.status = status;
        if (amount) this.amount = amount;
        if (currency) this.currency = currency;
        if (donorName) this.donorName = donorName;
        if (donorEmail) this.donorEmail = donorEmail;
        if (createdAt) this.createdAt = createdAt
        if (cotisation) this.cotisation = cotisation;
        if (type) this.type = type;
    }
}
