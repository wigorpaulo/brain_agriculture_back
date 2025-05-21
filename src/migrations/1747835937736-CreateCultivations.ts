import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCultivations1747835937736 implements MigrationInterface {
  name = 'CreateCultivations1747835937736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('cultivations');

    if (!tableExists) {
      await queryRunner.query(`CREATE TABLE "cultivations"
                             (
                               "id"               SERIAL    NOT NULL,
                               "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
                               "updated_at"       TIMESTAMP NOT NULL DEFAULT now(),
                               "ruralPropertyId"  integer,
                               "harvestId"        integer,
                               "plantedCultureId" integer,
                               "createdById"      integer,
                               CONSTRAINT "PK_b28ad6f7b0b4076361b0ce43c2a" PRIMARY KEY ("id")
                             )`);
      await queryRunner.query(`ALTER TABLE "cultivations"
      ADD CONSTRAINT "FK_dc964a9dab7e1be1dd1f6729586" FOREIGN KEY ("ruralPropertyId") REFERENCES "rural_properties" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "cultivations"
      ADD CONSTRAINT "FK_5718fcd98f7cd64f9ae374238b3" FOREIGN KEY ("harvestId") REFERENCES "harvests" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "cultivations"
      ADD CONSTRAINT "FK_ce4137c013f27adc9fc9ab54c14" FOREIGN KEY ("plantedCultureId") REFERENCES "planted_cultures" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "cultivations"
        ADD CONSTRAINT "FK_48325e44ff38805fe062796fe5a" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cultivations"
      DROP CONSTRAINT "FK_48325e44ff38805fe062796fe5a"`);
    await queryRunner.query(`ALTER TABLE "cultivations"
      DROP CONSTRAINT "FK_ce4137c013f27adc9fc9ab54c14"`);
    await queryRunner.query(`ALTER TABLE "cultivations"
      DROP CONSTRAINT "FK_5718fcd98f7cd64f9ae374238b3"`);
    await queryRunner.query(`ALTER TABLE "cultivations"
      DROP CONSTRAINT "FK_dc964a9dab7e1be1dd1f6729586"`);
    await queryRunner.query(`DROP TABLE "cultivations"`);
  }
}
