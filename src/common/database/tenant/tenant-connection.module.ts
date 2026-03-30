// database/tenant/tenant-connection.manager.ts
import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { LRUCache } from 'lru-cache';
import { DataSource } from 'typeorm';
import { TenantRepository } from '../../../modules/tenant/tenant.repository';

@Injectable()
export class TenantConnectionManager implements OnModuleDestroy {
  private cache: LRUCache<string, DataSource>;

  constructor(private tenantRepo: TenantRepository) {
    this.cache = new LRUCache<string, DataSource>({
      max: 100, // max 100 tenant connections cached

      // Called automatically when an entry is evicted
      disposeAfter: async (connection: DataSource, tenantId: string) => {
        if (connection.isInitialized) {
          await connection.destroy();
          console.log(`Connection closed for tenant: ${tenantId}`);
        }
      },
    });
  }

  async getConnection(tenantId: string): Promise<DataSource> {
 const cached = this.cache.get(tenantId);
  if (cached) return cached; 

    const tenant = await this.tenantRepo.getByTenantId(tenantId);
    if (!tenant) throw new NotFoundException('Tenant not found');

    const dataSource = new DataSource({
      type: 'postgres',
      host: tenant.dbHost,
      port: tenant.dbPort,
      username: tenant.dbUser,
      password: tenant.dbPassword,
      database: tenant.dbName,
      synchronize: false,
      entities: [
        __dirname + '/../../modules/tenant-modules/**/*.entity{.ts,.js}',
      ],
        migrations: [
      __dirname + '/../../modules/tenant-modules/migrations/**/*{.ts,.js}', // ← add this
    ],
    migrationsRun: false,
      poolSize: 5, // keep pool small per tenant
    });

    await dataSource.initialize();
    this.cache.set(tenantId, dataSource);
    return dataSource;
  }

  async closeConnection(tenantId: string) {
    const conn = this.cache.get(tenantId);
    if (conn?.isInitialized) {
      await conn.destroy();
      this.cache.delete(tenantId);
    }
  }

  // Clean up all connections on app shutdown
  async onModuleDestroy() {
    for (const [tenantId, conn] of this.cache.entries()) {
      if (conn.isInitialized) {
        await conn.destroy();
        console.log(`Shutdown: closed connection for tenant ${tenantId}`);
      }
    }
    this.cache.clear();
  }
}