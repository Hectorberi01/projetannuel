import {DataSource} from "typeorm";


export class AdminUseCase {

    constructor(private readonly db: DataSource) {
    }

    async reindexDatabase(): Promise<void> {
        try {
            if (!this.db.isInitialized) {
                await this.db.initialize();
            }

            const tables = await this.db.query('SHOW TABLES');

            for (const table of tables) {
                const tableName = table[`Tables_in_${this.db.options.database}`];
                console.log(`Optimizing table: ${tableName}`);
                await this.db.query(`OPTIMIZE TABLE ${tableName}`);
            }

            console.log('Database reindexing (optimization) completed successfully.');
        } catch (error) {
            console.error('Error during database reindexing (optimization):', error);
            throw error;
        }
    }

}
