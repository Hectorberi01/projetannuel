import express from "express";
import { useraccountRoutes } from "./handlers/useraccount-route";
import { clubRoutes } from "./handlers/club-route";
import { documentsRoutes } from "./handlers/document-route";
import { formationcenterRoutes } from "./handlers/formationcenter-route";
import { imageRoutes } from "./handlers/image-route";
import { newletterRoutes } from "./handlers/newletter-route";
import { playerRoutes } from "./handlers/player-route";
import { roleRoutes } from "./handlers/roles-route";
import { userRoutes } from "./handlers/user-route";
import { dontsRoutes } from "./handlers/donts-route";
import { eventsRoutes } from "./handlers/events-route";
import { sportRoutes } from "./handlers/sport-route";
import { AppDataSource } from "./database/database";
import 'reflect-metadata';
import 'dotenv/config';
import path from 'path';
import { sondagesRoutes } from "./handlers/sondage-route";

const cors = require('cors');
require('dotenv').config();

const main = async () => {
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

    // Pour autoriser toutes les origins
    app.use(cors());

    console.log("Setting up routes...");
    try {
        useraccountRoutes(app);
        clubRoutes(app);
        documentsRoutes(app);
        formationcenterRoutes(app);
        newletterRoutes(app);
        playerRoutes(app);
        roleRoutes(app);
        userRoutes(app);
        dontsRoutes(app);
        eventsRoutes(app);
        sportRoutes(app);
        sondagesRoutes(app);
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
