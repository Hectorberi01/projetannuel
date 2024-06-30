import cron from 'node-cron';
import {AppDataSource} from "../database/database";
import {CotisationUseCase} from "../domain/cotisation-usecase";
import {AdminUseCase} from "../domain/admin-usecase";

AppDataSource.initialize().then(() => {
    const cotisationUseCase = new CotisationUseCase(AppDataSource);
    const adminUseCase = new AdminUseCase(AppDataSource);

    cron.schedule('0 7 * * *', async () => {
        console.log('Running daily unpaid cotisation check...');
        try {
            await cotisationUseCase.verifyUnpaidCotisation();
            console.log('Unpaid cotisation check completed successfully.');
        } catch (error) {
            console.error('Error during unpaid cotisation check:', error);
        }
    });

    cron.schedule('0 2 * * *', async () => {
        console.log('Running daily database reindex...');
        try {
            await adminUseCase.reindexDatabase();
            console.log('Database reindexing completed successfully.');
        } catch (error) {
            console.error('Error during database reindexing:', error);
        }
    });

    console.log('Daily unpaid cotisation check scheduled.');
}).catch(error => console.log('Error initializing data source:', error));