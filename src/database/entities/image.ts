import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Image {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Type!: string
    @Column() Path!: string
    @Column() Name!: string

    constructor(id?: number,entity_key?:string, type?: string,path?: string, name?: string,extension?:string) {
        if (id) this.Id = id;
        if(type) this.Type = type;
        if(path) this.Path = path;
        if (name) this.Name = name;
    }
}
