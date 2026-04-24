import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeEnumValues1776094715825 implements MigrationInterface {
    name = 'NormalizeEnumValues1776094715825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."admins_role_enum" RENAME TO "admins_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."admins_role_enum" AS ENUM('admin', 'super_admin')`);
        await queryRunner.query(`ALTER TABLE "admins" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "admins" ALTER COLUMN "role" TYPE "public"."admins_role_enum" USING "role"::"text"::"public"."admins_role_enum"`);
        await queryRunner.query(`ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'admin'`);
        await queryRunner.query(`DROP TYPE "public"."admins_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."admins_role_enum_old" AS ENUM('ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`ALTER TABLE "admins" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "admins" ALTER COLUMN "role" TYPE "public"."admins_role_enum_old" USING "role"::"text"::"public"."admins_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'ADMIN'`);
        await queryRunner.query(`DROP TYPE "public"."admins_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."admins_role_enum_old" RENAME TO "admins_role_enum"`);
    }

}
