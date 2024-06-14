import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {User} from './user';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    role!: string;

    @OneToMany(() => User, user => user.role)
    users!: User[];

    constructor(id?: number, role?: string, users?: User[]) {
        if (id) this.id = id;
        if (role) this.role = role;
        if (users) this.users = users;
    }
}
