import { DataSource } from "typeorm";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 8889,
    username: "root",
    password: "root",
    database: "testjs",
    logging: true, 
    synchronize: true,
    entities: [
        "src/database/entities/*.ts"
    ],
    migrations: [
        "src/database/migrations/*.ts"
    ]
})