import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Image {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Entity_key!: string
    @Column() Type!: string
    @Column() Path!: string
    @Column() Name!: string
    @Column() Extension!: string

    constructor(id?: number,entity_key?:string, type?: string,path?: string, name?: string,extension?:string) {
        if (id) this.Id = id;
        if(entity_key) this.Entity_key = entity_key;
        if(type) this.Type = type;
        if(path) this.Path = path;
        if (name) this.Name = name;
        if (extension) this.Extension = extension;
    }
}
