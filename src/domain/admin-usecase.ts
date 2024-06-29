import {DataSource} from "typeorm";


export class AdminUseCase {

    constructor(private readonly db: DataSource) {
    }

    async reindexDatabase(): Promise<void> {
        try {
            // Vérifiez que la connexion est établie
            if (!this.db.isInitialized) {
                await this.db.initialize();
            }

            // Obtenez la liste de toutes les tables de la base de données
            const tables = await this.db.query('SHOW TABLES');

            // Exécutez OPTIMIZE TABLE pour chaque table
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
