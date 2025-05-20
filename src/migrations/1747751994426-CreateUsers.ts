import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1747751994426 implements MigrationInterface {
  name = 'CreateUsers1747751994426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('users');

    if (!tableExists) {
      await queryRunner.query(`CREATE TABLE "users"
                               (
                                 "id"         SERIAL            NOT NULL,
                                 "name"       character varying NOT NULL,
                                 "email"      character varying NOT NULL,
                                 "password"   character varying NOT NULL,
                                 "created_at" TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updated_at" TIMESTAMP         NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
                               )`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
