import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRuralProperties1747789625840 implements MigrationInterface {
  name = 'CreateRuralProperties1747789625840';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('rural_properties');

    if (!tableExists) {
      await queryRunner.query(`ALTER TABLE "producers"
      DROP CONSTRAINT "FK_fde1e5cbd9bb8bd8943f089d607"`);
      await queryRunner.query(`CREATE TABLE "rural_properties"
                               (
                                 "id"              SERIAL            NOT NULL,
                                 "farm_name"       character varying NOT NULL,
                                 "total_area"      numeric(10, 2)    NOT NULL,
                                 "arable_area"     numeric(10, 2)    NOT NULL,
                                 "vegetation_area" numeric(10, 2)    NOT NULL,
                                 "created_at"      TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updated_at"      TIMESTAMP         NOT NULL DEFAULT now(),
                                 "producerId"      integer,
                                 "cityId"          integer,
                                 "createdById"     integer,
                                 CONSTRAINT "PK_056944d83040eaf2c1c4921eeec" PRIMARY KEY ("id")
                               )`);
      await queryRunner.query(`ALTER TABLE "rural_properties"
      ADD CONSTRAINT "FK_9e33eed04cc1379a40f5eb04317" FOREIGN KEY ("producerId") REFERENCES "producers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "rural_properties"
      ADD CONSTRAINT "FK_3a6339abdc30edb1906c4bd6960" FOREIGN KEY ("cityId") REFERENCES "cities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "rural_properties"
      ADD CONSTRAINT "FK_ff73df44e00c32d14e189fc9fd9" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "producers"
      ADD CONSTRAINT "FK_726d24fd0c9c0142d5ca47b73d1" FOREIGN KEY ("cityId") REFERENCES "cities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "producers"
      DROP CONSTRAINT "FK_726d24fd0c9c0142d5ca47b73d1"`);
    await queryRunner.query(`ALTER TABLE "rural_properties"
      DROP CONSTRAINT "FK_ff73df44e00c32d14e189fc9fd9"`);
    await queryRunner.query(`ALTER TABLE "rural_properties"
      DROP CONSTRAINT "FK_3a6339abdc30edb1906c4bd6960"`);
    await queryRunner.query(`ALTER TABLE "rural_properties"
      DROP CONSTRAINT "FK_9e33eed04cc1379a40f5eb04317"`);
    await queryRunner.query(`DROP TABLE "rural_properties"`);
    await queryRunner.query(`ALTER TABLE "producers"
      ADD CONSTRAINT "FK_fde1e5cbd9bb8bd8943f089d607" FOREIGN KEY ("cityId") REFERENCES "cities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
