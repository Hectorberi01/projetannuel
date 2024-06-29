import cron from 'node-cron';
import {AppDataSource} from "../database/database";
import {CotisationUseCase} from "../domain/cotisation-usecase";

AppDataSource.initialize().then(() => {
    const useCase = new CotisationUseCase(AppDataSource);

    cron.schedule('0 7 * * *', async () => {
        console.log('Running daily unpaid cotisation check...');
        try {
            await useCase.verifyUnpaidCotisation();
            console.log('Unpaid cotisation check completed successfully.');
        } catch (error) {
            console.error('Error during unpaid cotisation check:', error);
        }
    });

    console.log('Daily unpaid cotisation check scheduled.');
}).catch(error => console.log('Error initializing data source:', error));
