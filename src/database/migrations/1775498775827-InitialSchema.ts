import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775498775827 implements MigrationInterface {
    name = 'InitialSchema1775498775827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "description" character varying(160), "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum" AS ENUM('TENANT_ADMIN', 'TENANT_STAFF', 'PATIENT')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(75) NOT NULL, "middleName" character varying(75), "lastName" character varying(75) NOT NULL, "email" character varying(191) NOT NULL, "password" character varying(191) NOT NULL, "phoneNumber" character varying(20), "isActive" boolean NOT NULL DEFAULT true, "emailVerifiedAt" TIMESTAMP, "lastLoginAt" TIMESTAMP, "userType" "public"."users_usertype_enum" NOT NULL DEFAULT 'TENANT_ADMIN', "roleId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."otps_purpose_enum" AS ENUM('general', 'verification', 'reset_password')`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(191) NOT NULL, "code" character varying(255) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "verified" boolean NOT NULL DEFAULT false, "purpose" "public"."otps_purpose_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9bd09e59708ea02bb49081961c" ON "otps" ("email") `);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("roleId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId") `);
        await queryRunner.query(`CREATE TABLE "user_direct_permissions" ("userId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_a298570ccbdb7e273d7abcf7f96" PRIMARY KEY ("userId", "permissionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1e14c4b2ec1adda08ea3c0b027" ON "user_direct_permissions" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f83152f7ccfa59cc136630e4be" ON "user_direct_permissions" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_direct_permissions" ADD CONSTRAINT "FK_1e14c4b2ec1adda08ea3c0b0274" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_direct_permissions" ADD CONSTRAINT "FK_f83152f7ccfa59cc136630e4bed" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_direct_permissions" DROP CONSTRAINT "FK_f83152f7ccfa59cc136630e4bed"`);
        await queryRunner.query(`ALTER TABLE "user_direct_permissions" DROP CONSTRAINT "FK_1e14c4b2ec1adda08ea3c0b0274"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f83152f7ccfa59cc136630e4be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e14c4b2ec1adda08ea3c0b027"`);
        await queryRunner.query(`DROP TABLE "user_direct_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bd09e59708ea02bb49081961c"`);
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TYPE "public"."otps_purpose_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
