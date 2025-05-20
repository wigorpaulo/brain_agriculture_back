import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProducers1747783885942 implements MigrationInterface {
  name = 'CreateProducers1747783885942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('producers');

    if (!tableExists) {
      await queryRunner.query(`CREATE TABLE "producers"
                               (
                                 "id"          SERIAL            NOT NULL,
                                 "cpf_cnpj"    character varying NOT NULL,
                                 "name"        character varying NOT NULL,
                                 "created_at"  TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updated_at"  TIMESTAMP         NOT NULL DEFAULT now(),
                                 "cityId"    integer,
                                 "createdById" integer,
                                 CONSTRAINT "PK_7f16886d1a44ed0974232b82506" PRIMARY KEY ("id")
                               )`);
      await queryRunner.query(`ALTER TABLE "producers"
        ADD CONSTRAINT "FK_fde1e5cbd9bb8bd8943f089d607" FOREIGN KEY ("cityId") REFERENCES "cities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "producers"
        ADD CONSTRAINT "FK_f489a2e7cac44b7e0e66e89b8ec" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "producers"
      DROP CONSTRAINT "FK_f489a2e7cac44b7e0e66e89b8ec"`);
    await queryRunner.query(`ALTER TABLE "producers"
      DROP CONSTRAINT "FK_fde1e5cbd9bb8bd8943f089d607"`);
    await queryRunner.query(`DROP TABLE "producers"`);
  }
}
