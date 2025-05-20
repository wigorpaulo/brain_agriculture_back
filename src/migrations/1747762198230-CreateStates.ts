import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStates1747762198230 implements MigrationInterface {
  name = 'CreateStates1747762198230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('states');

    if (!tableExists) {
      await queryRunner.query(`CREATE TABLE "states"
                               (
                                 "id"         SERIAL            NOT NULL,
                                 "uf"         character varying NOT NULL,
                                 "name"       character varying NOT NULL,
                                 "created_at" TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updated_at" TIMESTAMP         NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id")
                               )`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "states"`);
  }
}
