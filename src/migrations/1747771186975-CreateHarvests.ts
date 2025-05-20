import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHarvests1747771186975 implements MigrationInterface {
  name = 'CreateHarvests1747771186975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('harvests');

    if (!tableExists) {
      await queryRunner.query(`CREATE TABLE "harvests"
                             (
                               "id"          SERIAL            NOT NULL,
                               "name"        character varying NOT NULL,
                               "created_at"  TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"  TIMESTAMP         NOT NULL DEFAULT now(),
                               "createdById" integer,
                               CONSTRAINT "PK_fb748ae28bc0000875b1949a0a6" PRIMARY KEY ("id")
                             )`);
      await queryRunner.query(`ALTER TABLE "harvests"
        ADD CONSTRAINT "FK_7a7d010c29e154dd242d999348d" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "harvests"
      DROP CONSTRAINT "FK_7a7d010c29e154dd242d999348d"`);
    await queryRunner.query(`DROP TABLE "harvests"`);
  }
}
