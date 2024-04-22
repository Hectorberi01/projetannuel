import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"

@Entity()
export class Documents {
    @PrimaryGeneratedColumn() Id!: number
    @Column() Type!: string
    @Column() Path!:string
    @Column() Name!: string
    @Column() User_Id!: number
    @Column() Id_Image!: number

    constructor(id?: number, name?: string,type?: string, path?: string,user_id?:number,id_image?:number) {
        if (id) this.Id = id;
        if(type) this.Type = type;
        if(path) this.Path = path;
        if (name) this.Name = name;
        if(user_id) this.User_Id = user_id;
        if(id_image) this.Id_Image = id_image;
    }
}
