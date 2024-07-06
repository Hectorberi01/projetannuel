import { DataSource } from "typeorm";
import { CustomNamingStrategy } from "../middlewares/customNamingStrategy";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const config: any = {
    type: "mysql",
    username: isProduction ? process.env.PROD_DB_USERNAME : process.env.DB_USERNAME,
    password: isProduction ? process.env.PROD_DB_PASSWORD : process.env.DB_PASSWORD,
    database: isProduction ? process.env.PROD_DB_DATABASE : process.env.DB_DATABASE,
    logging: true,
    synchronize: true,
    connectTimeout: 20000,
    acquireTimeout: 20000,
    entities: [
        path.join(__dirname, isProduction ? "./entities/*.js" : "./entities/*.ts")
    ],
    migrations: [
        path.join(__dirname, isProduction ? "./migrations/*.js" : "./migrations/*.ts")
    ],
    namingStrategy: new CustomNamingStrategy(),
};

if (isProduction) {
    config.socketPath = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
} else {
    config.host = process.env.DB_HOST;
    config.port = parseInt(process.env.DB_PORT || '8889');
}

export const AppDataSource = new DataSource(config);
