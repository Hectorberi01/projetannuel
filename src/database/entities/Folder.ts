import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    JoinColumn
} from "typeorm";
import { Document } from './document';
import { User } from "./user";

@Entity()
export class Folder {
    @PrimaryGeneratedColumn()
    id!: number;


    @Column()
    familyName!: string

    constructor(
        name?: string,
        googleId?: string,
        documents?: Document[],
        user?: User
    ) {
        if (name) this.name = name;
        if (googleId) this.googleId = googleId;
        if (documents) this.documents = documents;
        if (user) this.user = user;
    }
}
