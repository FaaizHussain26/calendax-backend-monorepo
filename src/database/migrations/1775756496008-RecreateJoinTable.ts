import { MigrationInterface, QueryRunner } from "typeorm";

export class RecreateJoinTable1775756496008 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`DROP TABLE IF EXISTS "tenant_permission_groups"`);

    await queryRunner.query(`
      CREATE TABLE "tenant_permission_groups" (
        "tenant_id" uuid NOT NULL,
        "permission_group_id" uuid NOT NULL,
        CONSTRAINT "PK_tenant_permission_groups" 
          PRIMARY KEY ("tenant_id", "permission_group_id"),
        CONSTRAINT "FK_tenant_permission_groups_tenant" 
          FOREIGN KEY ("tenant_id") 
          REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tenant_permission_groups_group" 
          FOREIGN KEY ("permission_group_id") 
          REFERENCES "permission_groups"("id") ON DELETE CASCADE
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.query(`DROP TABLE IF EXISTS "tenant_permission_groups"`);

    }

}
