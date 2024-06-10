import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    type!: string;

    @Column()
    path!: string;

    constructor(id?: number, name?: string, type?: string, path?: string) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (type) this.type = type;
        if (path) this.path = path;
    }
}
