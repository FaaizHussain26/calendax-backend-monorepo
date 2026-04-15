import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatetenantSchema1776280705350 implements MigrationInterface {
  name = 'UpdatetenantSchema1776280705350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add as nullable first (avoids NOT NULL violation on existing rows)
    await queryRunner.query(`ALTER TABLE "tenants" ADD "adminEmail" character varying(255) NULL`);
    await queryRunner.query(`ALTER TABLE "tenants" ADD "adminPassword" character varying(255) NULL`);

    // Step 2: Backfill existing rows
    await queryRunner.query(`UPDATE "tenants" SET "adminEmail" = 'unspecified' WHERE "adminEmail" IS NULL`);
    await queryRunner.query(`UPDATE "tenants" SET "adminPassword" = 'unspecified' WHERE "adminPassword" IS NULL`);

   
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "adminEmail"`);
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "adminPassword"`); // ✅ was dropping adminEmail twice
  }
}
