import express from "express";
import {documentsRoutes} from "./handlers/document-route";
import {formationcenterRoutes} from "./handlers/formationcenter-route";
import {playerRoutes} from "./handlers/player-route";
import {roleRoutes} from "./handlers/roles-route";
import {userRoutes} from "./handlers/user-route";
import {eventsRoutes} from "./handlers/events-route";
import {sportRoutes} from "./handlers/sport-route";
import {AppDataSource} from "./database/database";
import 'reflect-metadata';
import 'dotenv/config';
import path from 'path';
import {sondagesRoutes} from "./handlers/sondage-route";
import {questionsRoutes} from "./handlers/question-route";
import {clubRoutes} from "./handlers/club-route";
import {statsRoutes} from "./handlers/stats-route";
import dotenv from 'dotenv';
dotenv.config();

const cors = require('cors');

const validateEnvVariables = () => {
    const requiredEnvVars = [
        'ACCESS_TOKEN_SECRET',
        'R2_ACCOUNT_ID',
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
        'R2_BUCKET_NAME',
        'R2_BUCKET_PUBLIC_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        process.exit(1);
    }
};

const main = async () => {
    validateEnvVariables(); // Appeler la fonction de validation ici

    const app = express();
    const port = 4000;
    try {
        await AppDataSource.initialize();
        console.error("well connected to database");
    } catch (error) {
        console.log(error);
        console.error("Cannot contact database");
        process.exit(1);
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("ACCESS_TOKEN_SECRET is not defined");
        process.exit(1);
    }

    app.use(express.json());
    app.use('/images', express.static(path.join(__dirname, 'images'))); // Utilise le chemin relatif

    app.use(cors());

    console.log("Setting up routes...");
    try {
        clubRoutes(app);
        documentsRoutes(app);
        formationcenterRoutes(app);
        playerRoutes(app);
        roleRoutes(app);
        userRoutes(app);
        eventsRoutes(app);
        sportRoutes(app);
        sondagesRoutes(app);
        questionsRoutes(app);
        statsRoutes(app);
        console.log("Routes are set up successfully");
    } catch (error) {
        console.error("Error setting up routes:", error);
        process.exit(1);
    }

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

main().catch((error) => {
    console.error("Failed to start the server:", error);
    process.exit(1);
});