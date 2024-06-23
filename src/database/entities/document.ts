import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Folder } from './Folder';
import { User } from './user';

@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    filegoogleId!: string

    @Column()
    type!: string;

    @Column()
    path!: string;

    @ManyToOne(() => Folder, folder => folder.documents, { nullable: true })
    folder!: Folder;

    @ManyToOne(() => User, user => user.documents, { nullable: false })
    @JoinColumn({ name: 'userId'})
    user!: User;
    
    constructor(
        id?: number,
        name?: string,
        type?: string,
        path?: string,
        googleId?: string,
        folder?: Folder,
        user?: User
    ) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (type) this.type = type;
        if (path) this.path = path;
        if (googleId) this.filegoogleId = googleId
        if (folder) this.folder = folder
        if (user) this.user = user;
    }
}
