import { DataSource } from "typeorm";
import {CustomNamingStrategy} from "../middlewares/customNamingStrategy";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 8889,
    username: "root",
    password: "root",
    database: "sportvision",
    logging: true, 
    synchronize: true,
    entities: [
        "src/database/entities/*.ts"
    ],
    migrations: [
        "src/database/migrations/*.ts"
    ],
    namingStrategy: new CustomNamingStrategy(),
})