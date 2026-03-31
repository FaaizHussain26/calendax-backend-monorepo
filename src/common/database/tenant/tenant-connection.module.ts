// database/tenant/tenant-connection.manager.ts
import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { LRUCache } from 'lru-cache';
import { DataSource } from 'typeorm';
import { TenantRepository } from '../../../modules/tenant/tenant.repository';
import { ConfigService } from '@nestjs/config';
import { TenantEntity } from '../../../modules/tenant/tenant.entity';

@Injectable()
export class TenantConnectionManager implements OnModuleDestroy {
  private cache: LRUCache<string, DataSource>;

  constructor(private tenantRepo: TenantRepository,private configService: ConfigService) {
    this.cache = new LRUCache<string, DataSource>({
      max:  this.configService.get<number>('tenant.maxCacheSize') ?? 100,

      // Called automatically when an entry is evicted
      disposeAfter: async (connection: DataSource, tenantId: string) => {
        if (connection.isInitialized) {
          await connection.destroy();
          console.log(`Connection closed for tenant: ${tenantId}`);
        }
      },
    });
  }

  async getConnection(credentials: TenantEntity): Promise<DataSource> {
 const cached = this.cache.get(credentials.id);
  if (cached) return cached; 

    const tenant = await this.tenantRepo.getByTenantId(credentials.id);
    if (!tenant) throw new NotFoundException('Tenant not found');

    const dataSource = new DataSource({
      type: 'postgres',
      host: tenant.dbHost,
      port: tenant.dbPort,
      username: tenant.dbUser,
      password: tenant.dbPassword,
      database: tenant.dbName,
      synchronize: this.configService.get('environment')!=="production",
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
    this.cache.set(credentials.id, dataSource);
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