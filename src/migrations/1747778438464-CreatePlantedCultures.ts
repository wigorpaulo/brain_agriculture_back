import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlantedCultures1747778438464 implements MigrationInterface {
  name = 'CreatePlantedCultures1747778438464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('planted_cultures');

    if (!tableExists) {
      await queryRunner.query(`CREATE TABLE "planted_cultures"
                             (
                               "id"          SERIAL            NOT NULL,
                               "name"        character varying NOT NULL,
                               "created_at"  TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"  TIMESTAMP         NOT NULL DEFAULT now(),
                               "createdById" integer,
                               CONSTRAINT "PK_7426af0c25ead2c7cc2b6c18e26" PRIMARY KEY ("id")
                             )`);
      await queryRunner.query(`ALTER TABLE "planted_cultures"
        ADD CONSTRAINT "FK_fa76e87e1668128e5c0dade6c09" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "planted_cultures"
      DROP CONSTRAINT "FK_fa76e87e1668128e5c0dade6c09"`);
    await queryRunner.query(`DROP TABLE "planted_cultures"`);
  }
}
