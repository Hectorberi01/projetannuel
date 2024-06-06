import { Events } from "../database/entities/events";
import { Roles } from "../database/entities/roles";
import { Token } from "../database/entities/token";
import { User } from "../database/entities/useraccount";
import { Image } from "../database/entities/image";

// user.dto.ts
export class UserDTO {
    Id!: number;
    firstname!: string;
    lastname!: string;
    email!: string;
    birth_date!: Date;
    date_creation!: Date;
    address!: string;
    roles!: Roles[];
    image?: ImageDTO; // Optional to avoid circular reference
    matricule!: number;
    password!: string;
    tokens!: Token[];
    events!: Events[];

    constructor(user: User) {
        this.Id = user.id;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.email = user.email;
        this.birth_date = user.birth_date;
        this.date_creation = user.date_creation;
        this.address = user.address;
        this.roles = user.roles;
        if (user.image) {
            this.image = new ImageDTO(user.image);
        }
        this.matricule = user.matricule;
        this.password = user.password;
        this.tokens = user.tokens;
        this.events = user.events;
    }
}

// image.dto.ts
export class ImageDTO {
    Id!: number;
    url!: string;
    user?: UserDTO; // Optional to avoid circular reference

    constructor(image: Image) {
        this.Id = image.Id;
        this.url = image.url;
        if (image.users) {
            this.user = new UserDTO(image.users);
        }
    }
}