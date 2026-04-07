import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775592496256 implements MigrationInterface {
    name = 'InitialSchema1775592496256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "indications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d0dac99764b80fba94d3831dc2f" UNIQUE ("slug"), CONSTRAINT "PK_733e768d3d560472919502a0d66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "protocols" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "protocolNumber" character varying NOT NULL, "indicationId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_753d80f61205ed2b9c2277e01eb" UNIQUE ("protocolNumber"), CONSTRAINT "PK_69900eec42c88582ac8affff3e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "prefix" character varying NOT NULL, "slug" character varying NOT NULL, "name" character varying NOT NULL, "siteNumber" character varying, "patientCount" integer NOT NULL DEFAULT '0', "phoneNumber" character varying, "streetAddress" character varying, "city" character varying, "state" character varying, "zipCode" character varying, "link" character varying, "image" character varying, "indicationId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_26503a75e987672fb5af9258cc2" UNIQUE ("slug"), CONSTRAINT "PK_4f5eccb1dfde10c9170502595a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "site_protocols" ("protocolId" uuid NOT NULL, "siteId" uuid NOT NULL, CONSTRAINT "PK_3f7b179544b26572a658c235cdd" PRIMARY KEY ("protocolId", "siteId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c828c6fcdf74ed1bee839fc9a5" ON "site_protocols" ("protocolId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4e5bd0f6774c2eba00ef3a7f9f" ON "site_protocols" ("siteId") `);
        await queryRunner.query(`CREATE TABLE "user_sites" ("userId" uuid NOT NULL, "siteId" uuid NOT NULL, CONSTRAINT "PK_ca67719284ca1e8d8923a675ae7" PRIMARY KEY ("userId", "siteId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_832c931a178f7619cd565b4a66" ON "user_sites" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f4e0fdd55e0d722a9167890539" ON "user_sites" ("siteId") `);
        await queryRunner.query(`ALTER TYPE "public"."users_usertype_enum" RENAME TO "users_usertype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum" AS ENUM('TENANT_ADMIN', 'TENANT_STAFF', 'PATIENT', 'PRINCIPLE_INVESTIGATOR')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum" USING "userType"::"text"::"public"."users_usertype_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'TENANT_ADMIN'`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "protocols" ADD CONSTRAINT "FK_d721341df568f28b79f8fefd43d" FOREIGN KEY ("indicationId") REFERENCES "indications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sites" ADD CONSTRAINT "FK_dbebf9dd6ece5b8577b8c11e7e4" FOREIGN KEY ("indicationId") REFERENCES "indications"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site_protocols" ADD CONSTRAINT "FK_c828c6fcdf74ed1bee839fc9a56" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "site_protocols" ADD CONSTRAINT "FK_4e5bd0f6774c2eba00ef3a7f9f4" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_sites" ADD CONSTRAINT "FK_832c931a178f7619cd565b4a665" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_sites" ADD CONSTRAINT "FK_f4e0fdd55e0d722a91678905394" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_sites" DROP CONSTRAINT "FK_f4e0fdd55e0d722a91678905394"`);
        await queryRunner.query(`ALTER TABLE "user_sites" DROP CONSTRAINT "FK_832c931a178f7619cd565b4a665"`);
        await queryRunner.query(`ALTER TABLE "site_protocols" DROP CONSTRAINT "FK_4e5bd0f6774c2eba00ef3a7f9f4"`);
        await queryRunner.query(`ALTER TABLE "site_protocols" DROP CONSTRAINT "FK_c828c6fcdf74ed1bee839fc9a56"`);
        await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "FK_dbebf9dd6ece5b8577b8c11e7e4"`);
        await queryRunner.query(`ALTER TABLE "protocols" DROP CONSTRAINT "FK_d721341df568f28b79f8fefd43d"`);
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum_old" AS ENUM('TENANT_ADMIN', 'TENANT_STAFF', 'PATIENT')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum_old" USING "userType"::"text"::"public"."users_usertype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'TENANT_ADMIN'`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_usertype_enum_old" RENAME TO "users_usertype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f4e0fdd55e0d722a9167890539"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_832c931a178f7619cd565b4a66"`);
        await queryRunner.query(`DROP TABLE "user_sites"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e5bd0f6774c2eba00ef3a7f9f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c828c6fcdf74ed1bee839fc9a5"`);
        await queryRunner.query(`DROP TABLE "site_protocols"`);
        await queryRunner.query(`DROP TABLE "sites"`);
        await queryRunner.query(`DROP TABLE "protocols"`);
        await queryRunner.query(`DROP TABLE "indications"`);
    }

}
