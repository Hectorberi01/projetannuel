import express from "express";
import { initRoutes } from "./handlers/routes";
import {useraccountRoutes} from "./handlers/useraccount-route";
import {clubRoutes} from "./handlers/club-route";
import {documentsRoutes} from "./handlers/document-route";
import {formationcenterRoutes} from "./handlers/formationcenter-route";
import {functionRoutes} from "./handlers/function-route";
import {imageRoutes} from "./handlers/image-route";
import {newletterRoutes} from "./handlers/newletter-route";
import {playerRoutes} from "./handlers/player-route";
import {roleRoutes} from "./handlers/roles-route";
import {userRoutes} from "./handlers/user-route";
import {dontsRoutes} from "./handlers/donts-route";
import {eventsRoutes} from "./handlers/events-route";
import {sportRoutes} from "./handlers/sport-route";
import { AppDataSource } from "./database/database";
import 'dotenv/config';


const main = async () => {
    const app = express()
    const port = 3000
    try {

        await AppDataSource.initialize()
        console.error("well connected to database")
    } catch (error) {
        console.log(error)
        console.error("Cannot contact database")
        process.exit(1)
    }

    app.use(express.json())
    initRoutes(app)
    useraccountRoutes(app)
    clubRoutes(app)
    documentsRoutes(app)
    formationcenterRoutes(app)
    functionRoutes(app)
    imageRoutes(app)
    newletterRoutes(app)
    playerRoutes(app)
    roleRoutes(app)
    userRoutes(app)
    dontsRoutes(app)
    eventsRoutes(app)
    sportRoutes(app)

    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
}

main()