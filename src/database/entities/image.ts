import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import "reflect-metadata"
import { Player } from './player'

@Entity()
export class Image {
    @PrimaryGeneratedColumn() Id!: number
   // @Column() Type!: string
    @Column({ type: 'blob' })  // Spécifiez correctement le type pour des données binaires
    Path!: Buffer;  //
   // @Column() Name!: string
    @OneToMany(() => Player, player => player.Image)  // Correction pour spécifier la propriété côté Player
    players!: Player[];

    constructor(id?: number, type?: string,path?: Buffer, name?: string) {
        if (id) this.Id = id;
        //if(type) this.Type = type;
        if(path) this.Path = path;
       // if (name) this.Name = name;
    }
}
