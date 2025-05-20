import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCities1747767055192 implements MigrationInterface {
  name = 'CreateCities1747767055192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('cities');

    if (!tableExists) {
      await queryRunner.query(`CREATE TABLE "cities"
                             (
                               "id"         SERIAL            NOT NULL,
                               "name"       character varying NOT NULL,
                               "created_at" TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at" TIMESTAMP         NOT NULL DEFAULT now(),
                               "stateId"    integer,
                               CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id")
                             )`);

      await queryRunner.query(`ALTER TABLE "cities"
        ADD CONSTRAINT "FK_ded8a17cd090922d5bac8a2361f" FOREIGN KEY ("stateId") REFERENCES "states" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cities"
      DROP CONSTRAINT "FK_ded8a17cd090922d5bac8a2361f"`);
    await queryRunner.query(`DROP TABLE "cities"`);
  }
}
