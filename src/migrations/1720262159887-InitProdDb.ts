import { MigrationInterface, QueryRunner } from "typeorm";

export class InitProdDb1720262159887 implements MigrationInterface {
    name = 'InitProdDb1720262159887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`birth_date\` \`birth_date\` timestamp NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`birth_date\` \`birth_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    }

}
