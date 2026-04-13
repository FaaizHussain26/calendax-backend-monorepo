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

    const dataSource = new DataSource({
      type: 'postgres',
      host: tenant.dbHost,
      port: tenant.dbPort,
      username: tenant.dbUser,
      password: tenant.dbPassword,
      database: tenant.dbName,
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
        ProtocolDocumentMetaEntity
      ],

      migrations: [
        __dirname + '/../../modules/tenant-modules/migrations/**/*{.ts,.js}', // ← add this
      ],
      migrationsRun: false,
      extra: {
        max: 5,
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    });
    if (!tenant.mongoUri) {
      throw new Error(`MongoDB URI missing for tenant: ${tenant.slug}`);
    }
    const mongoClient = new MongoClient(tenant.mongoUri);
    await Promise.all([dataSource.initialize(), mongoClient.connect()]);
    const connectionContext: TenantConnection = {
      sql: dataSource,
      mongo: mongoClient.db(), // Returns the DB from the URI
      mongoClient: mongoClient,
    };

    this.cache.set(tenant.id, connectionContext);
    return connectionContext;
  }
  async getContext(tenant: TenantEntity): Promise<TenantConnection> {
    const cached = this.cache.get(tenant.id);
    if (cached) return cached;

    // Initialize both in parallel for speed
    const sqlAttr: DataSourceOptions = {
      type: 'postgres',
      host: tenant.dbHost,
      port: tenant.dbPort,
      username: tenant.dbUser,
      password: tenant.dbPassword,
      database: tenant.dbName,
      synchronize: this.configService.get('environment') !== 'production',
      entities: [PermissionGroupEntity, PermissionEntity, RoleEntity, UserEntity, OtpEntity],

      // migrations: [
      //   __dirname + '/../../modules/tenant-modules/migrations/**/*{.ts,.js}', // ← add this
      // ],
      migrationsRun: false,
      extra: {
        max: 5,
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
    const dataSource = new DataSource(sqlAttr);
    const mongoClient = new MongoClient(tenant.mongoUri!);

    await Promise.all([dataSource.initialize(), mongoClient.connect()]);

    const context: TenantConnection = {
      sql: dataSource,
      mongo: mongoClient.db(),
      mongoClient: mongoClient,
    };

    this.cache.set(tenant.id, context);
    return context;
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
