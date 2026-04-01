import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TenantRepository } from './tenant.repository';

import {
  CreateTenantDto,
  TenantResponseDto,
  UpdateTenantDto,
} from './tenant.dto';
import { plainToInstance } from 'class-transformer';
import { entityNotFound } from '../../common/exceptions/notFound.exception';
import { TenantConnectionManager } from '../../common/database/tenant/tenant-connection.manager';
import { ConfigService } from '@nestjs/config';
import { HelperFunctions } from '../../common/utils/functions';
import { TenantStatus } from '../../enums/tenant.enum';
import { TenantEntity } from './tenant.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdminPermissionGroupRepository } from '../permission-group/permission-group.repository';

@Injectable()
export class TenantService {
  constructor(
    @InjectDataSource('master')
    private masterDataSource: DataSource,
    private readonly tenantRepository: TenantRepository,
    private connectionManager: TenantConnectionManager,
    private readonly configService: ConfigService,
    private readonly adminPermissionGroupRepository: AdminPermissionGroupRepository,
  ) {}

  async getAllTenants() {
    try {
      return await this.tenantRepository.getAllTenants();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async getTenantById(id: string) {
    try {
      const tenant = await this.tenantRepository.getByTenantId(id);
      entityNotFound(tenant, 'Tenant');
      return tenant;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async createTenant(dto: CreateTenantDto) {
    const slug = HelperFunctions.generateSlug(dto.name);
    const dbName = `tenant_${slug}`;
    const dbPassword = HelperFunctions.generateSecurePassword();
    let tenant: TenantEntity | null = null;

    const existing = await this.tenantRepository.findBySlug(slug);
    if (existing)
      throw new ConflictException('Tenant with this name already exists');
    
    const dashboardGroup =
      await this.adminPermissionGroupRepository.findBySlug('dashboard');
    if (!dashboardGroup) {
      throw new NotFoundException(
        'Dashboard permission group not found. Run seeders first.',
      );
    }
    try {
      // 1. Provision the database first
      await this.provisionDatabase(dbName, slug, dbPassword);

      // 2. Save tenant record with PROVISIONING status
      tenant = await this.tenantRepository.createTenant({
        ...dto,
        slug,
        dbHost: this.configService.get<string>('tenant.db.host'),
        dbPort: this.configService.get<number>('tenant.db.port') ?? 5432,
        dbUser: slug,
        dbPassword,
        dbName,
        status: TenantStatus.PROVISIONING,
      });

      // 3. Run migrations on tenant DB
      const connection = await this.connectionManager.getConnection(tenant);
      await connection.runMigrations();

      // 4. Only mark ACTIVE after everything succeeded
      await this.tenantRepository.updateTenant(tenant.id, {
        status: TenantStatus.ACTIVE,
      });

      return tenant;
    } catch (error) {
      // 5. Rollback everything if anything fails
      await this.handleProvisioningFailure(tenant, dbName, slug, error);
      throw new InternalServerErrorException(
        'Tenant provisioning failed. Changes have been rolled back.',
      );
    }
  }
  private async handleProvisioningFailure(
    tenant: TenantEntity | null,
    dbName: string,
    dbUser: string,
    error: unknown,
  ) {
    console.error('Provisioning failed, rolling back...', error);

    try {
      // Mark tenant as failed if record was created
      if (tenant?.id) {
        await this.tenantRepository.updateTenant(tenant.id, {
          status: TenantStatus.FAILED,
        });

        // Close any open connection for this tenant
        await this.connectionManager.closeConnection(tenant.id);
      }

      // Drop the DB and user if they were created
      await this.deprovisionDatabase(dbName, dbUser);
    } catch (rollbackError) {
      // Log rollback failure but don't throw — original error takes priority
      console.error('Rollback also failed:', rollbackError);
    }
  }

  private async provisionDatabase(
    dbName: string,
    dbUser: string,
    dbPassword: string,
  ) {
    const masterConn = this.masterDataSource;
    await masterConn.query(`CREATE DATABASE "${dbName}"`);
    await masterConn.query(
      `CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}'`,
    );
    await masterConn.query(
      `GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}"`,
    );

    // Connect to tenant DB as superuser to grant schema permissions
    const tenantAdminConn = new DataSource({
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT') ?? 5432,
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: dbName,
    });

    await tenantAdminConn.initialize();
    await tenantAdminConn.query(`GRANT ALL ON SCHEMA public TO "${dbUser}"`);
    await tenantAdminConn.query(
      `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${dbUser}"`,
    );
    await tenantAdminConn.query(
      `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${dbUser}"`,
    );
    await tenantAdminConn.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${dbUser}"`,
    );
    await tenantAdminConn.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${dbUser}"`,
    );
    await tenantAdminConn.destroy();
  }

  private async deprovisionDatabase(dbName: string, dbUser: string) {
    const masterConn = this.masterDataSource;

    // Terminate active connections before dropping
    await masterConn.query(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${dbName}'
    AND pid <> pg_backend_pid()
  `);

    await masterConn.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    await masterConn.query(`DROP USER IF EXISTS "${dbUser}"`);
  }

  async update(id: string, payload: UpdateTenantDto) {
    try {
      const tenant = await this.tenantRepository.getByTenantId(id);
      entityNotFound(tenant, 'Tenant');
      await this.tenantRepository.updateTenant(id, payload);
      const updatedEntity = await this.tenantRepository.getByTenantId(id);
      return plainToInstance(TenantResponseDto, updatedEntity, {
        excludeExtraneousValues: true,
      });
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteTenant(id: string) {
    try {
      const tenant = await this.tenantRepository.getByTenantId(id);
      entityNotFound(tenant, 'Tenant');
      await this.tenantRepository.delete(id);
      return { message: 'Tenant deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
