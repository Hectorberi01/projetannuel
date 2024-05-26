// import "reflect-metadata"
// import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
// import { User } from './useraccount';

// @Entity()
// export class Planning {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column()
//   titre!: string;

//   @Column({ type: 'text', nullable: true })
//   description!: string;

//   @Column()
//   date_debut!: Date;

//   @Column()
//   date_fin!: Date;

//   @Column({ nullable: true })
//   lieu!: string;

//   @Column({ nullable: true })
//   type_activite!: string;

//   @Column({ nullable: true })
//   recurrence!: string;

//   @Column({ nullable: true })
//   statut!: string;

//   @ManyToMany(() => User, user => user.plannings)
//   @JoinTable()
//   users!: User[];

//   constructor(
//         id? : number,
//         titre?: string,
//         description?: string,
//         date_debut?: Date,
//         date_fin?: Date,
//         lieu?: string,
//         type_activite?: string,
//         recurrence?: string,
//         statut?: string,
//         users?: User[]
//     ) 
//     {
//         if (id)this.id = id;
//         if (titre)this.titre = titre;
//         if (description)this.description = description;
//         if (date_debut)this.date_debut = date_debut;
//         if (date_fin)this.date_fin = date_fin;
//         if (lieu)this.lieu = lieu;
//         if (type_activite)this.type_activite = type_activite;
//         if (recurrence)this.recurrence = recurrence;
//         if (statut)this.statut = statut;
//         if (users)this.users = users || [];
//     }
// }

