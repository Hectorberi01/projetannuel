import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Documents {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Entity_key!: string
    @Column() Type!: string
    @Column() Path!:string
    @Column() Name!: string

    constructor(id?: number,entity_key?:string, name?: string,type?: string, path?: string) {
        if (id) this.Id = id;
        if(entity_key) this.Entity_key = entity_key;
        if(type) this.Type = type;
        if(path) this.Path = path;
        if (name) this.Name = name;
    }
}
