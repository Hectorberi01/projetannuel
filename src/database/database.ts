import { DataSource } from "typeorm";
import { CustomNamingStrategy } from "../middlewares/customNamingStrategy";
import path from "path";

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
        path.join(__dirname, "./entities/*.js")
    ],
    migrations: [
        path.join(__dirname, "./migrations/*.js")
    ],
    namingStrategy: new CustomNamingStrategy(),
});
