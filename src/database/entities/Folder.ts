import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from "typeorm";
import {Document} from './document'
import { User } from "./user";

@Entity()
export class Folder {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    googleId!: string

    @Column()
    name!: string;

    @OneToMany(() => Document, document => document.folder)
    documents!: Document[];

    @ManyToOne(() => User, user => user.folder, { nullable: false })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    constructor( 
        name?:string,
        googleId?: string,
        document?: Document[],
        user?: User
    ){
        if(name) this.name = name
        if(googleId) this.googleId = googleId
        if(document) this.documents = document
        if(user) this.user = user
    }

}