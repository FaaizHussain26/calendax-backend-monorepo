// database/tenant/tenant-connection.manager.ts
import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { LRUCache } from 'lru-cache';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TenantRepository } from '../../modules/tenant/tenant.repository';
import { ConfigService } from '@nestjs/config';
import { TenantEntity } from '../../modules/tenant/tenant.entity';
import { PermissionGroupEntity } from '../../modules/tenant-modules/rbac/permission-group/permission-group.entity';
import { PermissionEntity } from '../../modules/tenant-modules/rbac/permission/permission.entity';
import { RoleEntity } from '../../modules/tenant-modules/rbac/role/role.entity';
import { UserEntity } from '../../modules/tenant-modules/user/user.entity';
import { OtpEntity } from '../../modules/tenant-modules/auth/otp/otp.entity';
import { Db, MongoClient } from 'mongodb';
import { SiteEntity } from '../../modules/tenant-modules/site/site.entity';
import { ProtocolEntity } from '../../modules/tenant-modules/protocol/protocol.entity';
import { IndicationEntity } from '../../modules/tenant-modules/indication/indication.entity';
import { ProtocolDocumentMetaEntity } from '../../modules/tenant-modules/protocol/document/document-meta.entity';
import { QuestionEntity } from '../../modules/tenant-modules/question/question.entity';
import { BusinessConfigEntity } from '../../modules/tenant-modules/business-config/business-config.entity';
import { AgentConfigEntity } from '../../modules/tenant-modules/agent-config/agent-config.entity';
import { CallingConfigEntity } from '../../modules/tenant-modules/calling-config/calling-config.entity';
import { FacebookConfigEntity } from '../../modules/tenant-modules/facebook/entities/facebook-config.entity';
import { FacebookFormEntity } from '../../modules/tenant-modules/facebook/entities/facebook-form.entity';
import { LeadEntity } from '../../modules/tenant-modules/lead/lead.entity';
import { PatientEntity } from '../../modules/tenant-modules/patients/patient.entity';
export type TenantConnection = {
  sql: DataSource;
  mongo: Db;
  mongoClient: MongoClient;
};
@Injectable()
export class TenantConnectionManager implements OnModuleDestroy {
  private cache: LRUCache<string, TenantConnection>;

  constructor(private configService: ConfigService) {
    this.cache = new LRUCache<string, TenantConnection>({
      max: this.configService.get<number>('tenant.maxCacheSize') ?? 100,

      // Called automatically when an entry is evicted
      disposeAfter: async (value: TenantConnection, tenantId: string) => {
        if (value.sql.isInitialized) await value.sql.destroy();
        await value.mongoClient.close();
        console.log(`Connections closed for tenant: ${tenantId}`);
      },
    });
  }

  async getConnection(tenant: TenantEntity): Promise<TenantConnection> {
    if (!tenant) throw new NotFoundException('Tenant context is missing');

    const cached = this.cache.get(tenant.id);
    if (cached) return cached;
    const dbUrl = this.configService.get<string>('db.postgres.url');
    const dataSource = new DataSource({
      type: 'postgres',
      ...(dbUrl
        ? {
            url: dbUrl?.replace(/\/[^/]+$/, `/${tenant.dbName}`),

            ssl: { rejectUnauthorized: false },
          }
        : {
            host: tenant.dbHost,
            port: tenant.dbPort,
            username: tenant.dbUser,
            password: tenant.dbPassword,
            database: tenant.dbName,
          }),
      synchronize: this.configService.get('environment') !== 'production',
      entities: [
        PermissionGroupEntity,
        PermissionEntity,
        RoleEntity,
        UserEntity,
        OtpEntity,
        SiteEntity,
        ProtocolEntity,
        IndicationEntity,
        ProtocolDocumentMetaEntity,
        QuestionEntity,
        BusinessConfigEntity,
        AgentConfigEntity,
        CallingConfigEntity,
        FacebookConfigEntity,
        FacebookFormEntity,
        LeadEntity,
        PatientEntity,
      ],

      migrations: [
        __dirname + '/../../modules/tenant-modules/migrations/**/*{.ts,.js}', // ← add this
      ],
      migrationsRun: false,
      extra: {
        max: 5,
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      },
    });
    if (!tenant.mongoUri) {
      throw new Error(`MongoDB URI missing for tenant: ${tenant.slug}`);
    }
    const mongoClient = new MongoClient(tenant.mongoUri);
    try {
      await Promise.all([dataSource.initialize(), mongoClient.connect()]);
    } catch (error) {
      console.log("error initializing connectinos:",error)
      throw new Error(`Failed to initialize connections for tenant: ${tenant.slug}`);
    }
    const connectionContext: TenantConnection = {
      sql: dataSource,
      mongo: mongoClient.db(), // Returns the DB from the URI
      mongoClient: mongoClient,
    };

    this.cache.set(tenant.id, connectionContext);
    return connectionContext;
  }

  async closeConnection(tenantId: string) {
    const conn = this.cache.get(tenantId);
    if (conn) {
      if (conn.sql.isInitialized) await conn.sql.destroy();
      await conn.mongoClient.close();
      this.cache.delete(tenantId);
    }
  }

  // Clean up all connections on app shutdown
  async onModuleDestroy() {
    for (const [tenantId, conn] of this.cache.entries()) {
      if (conn.sql.isInitialized) await conn.sql.destroy();
      await conn.mongoClient.close();
    }
    this.cache.clear();
  }
}
