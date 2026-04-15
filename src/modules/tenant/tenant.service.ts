import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TenantRepository } from './tenant.repository';

import { CreateTenantDto, findTenantDto, TenantResponseDto, UpdateTenantDto } from './tenant.dto';
import { plainToInstance } from 'class-transformer';
import { entityNotFound } from '../../common/exceptions/notFound.exception';
import { TenantConnectionManager } from '../../database/tenant/tenant-connection.manager';
import { ConfigService } from '@nestjs/config';
import { HelperFunctions } from '../../common/utils/functions';
import { TenantStatus, TenantUserRoles } from '../../common/enums/tenant.enum';
import { TenantEntity } from './tenant.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdminPermissionGroupRepository } from '../permission-group/permission-group.repository';
import { AdminPermissionGroupEntity } from '../permission-group/permission-group.entity';
import { PermissionGroupEntity } from '../tenant-modules/rbac/permission-group/permission-group.entity';
import { PermissionEntity } from '../tenant-modules/rbac/permission/permission.entity';
import { RoleEntity } from '../tenant-modules/rbac/role/role.entity';
import { UserEntity } from '../tenant-modules/user/user.entity';

import { MongoAdminService } from '../../database/master/mongo-admin.service';
import { TenantQueueService } from '../../services/queues/services/tenant-queue.service';
@Injectable()
export class TenantService {
  constructor(
    @InjectDataSource('master')
    private masterDataSource: DataSource,
    private readonly tenantRepository: TenantRepository,
    private connectionManager: TenantConnectionManager,
    private readonly configService: ConfigService,
    private readonly adminPermissionGroupRepository: AdminPermissionGroupRepository,
    private readonly mongoAdmin: MongoAdminService,
    private readonly tenantQueueService: TenantQueueService,
  ) {}

  async getAllTenants(query: findTenantDto) {
    return await this.tenantRepository.getAllTenants(query);
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantRepository.getDetailedByTenantId(id);
    entityNotFound(tenant, 'Tenant');
    return tenant;
  }

  async getTenantBySlug(slug: string) {
    const tenant = await this.tenantRepository.findBySlug(slug, 'id');
    const tenant = await this.tenantRepository.findBySlug(slug, 'id');
    entityNotFound(tenant, 'Tenant');
    return tenant;
  }

  async createTenant(dto: CreateTenantDto) {
    const slug = HelperFunctions.generateSlug(dto.name);
    const dbName = `tenant_${slug}`;
    const dbPassword = HelperFunctions.generateSecurePassword();
    let tenant: TenantEntity | null = null;

    const existing = await this.tenantRepository.findBySlug(slug);
    if (existing) throw new ConflictException('Tenant with this name already exists');

    let requestedGroups: AdminPermissionGroupEntity[] = [];

    if (dto.allPermissions) {
      const { data } = await this.adminPermissionGroupRepository.findAll({ all: true });
      requestedGroups = data;
    } else if (dto.permissionGroupIds?.length) {
      requestedGroups = await this.adminPermissionGroupRepository.findDetailedByIds(dto.permissionGroupIds);
      if (requestedGroups.length !== dto.permissionGroupIds.length) {
        throw new NotFoundException('One or more permission groups not found');
      }
    } else {
      throw new BadRequestException('Select at least one permission group or enable allPermissions');
    }

    tenant = await this.tenantRepository.createTenant({
      ...dto,
      slug,
      dbHost: this.configService.get<string>('tenant.db.host'),
      dbPort: this.configService.get<number>('tenant.db.port') ?? 5432,
      dbUser: slug,
      dbPassword,
      dbName,
      mongoUri: 'mongoUri',
      status: TenantStatus.PROVISIONING,
      permissionGroups: requestedGroups,
    });
    const jobId = await this.tenantQueueService.addTenantJob({
      tenantId: tenant.id,
      dto,
      permissionGroup:requestedGroups,
      dbName,
      slug,
      dbPassword,
    });

    console.log('checking', jobId);
    return {
      tenant: await this.tenantRepository.getByTenantId(tenant.id),
      message: 'Tenant created. Tenant processing queued.',
      jobId,
    };
  }

  public async deprovisionMongoDatabase(dbName: string) {
    try {
      // Simply drop the database using the master client
      await this.mongoAdmin.clientInstance.db(dbName).dropDatabase();
      console.log(`Successfully dropped Mongo DB: ${dbName}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      console.warn(`Mongo cleanup warning: ${err.message}`);
    }
  }

  public async deprovisionDatabase(dbName: string, dbUser: string) {
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
    const tenant = await this.tenantRepository.getByTenantId(id);
    if (!tenant) throw new entityNotFound(tenant, 'Tenant');
    const { permissionGroupIds, ...tenantPayload } = payload;
    await this.tenantRepository.updateTenant(id, tenantPayload);
    const updatedEntity = await this.tenantRepository.getByTenantId(id);
    let requestedGroups;
    if (permissionGroupIds) {
      requestedGroups = await this.adminPermissionGroupRepository.findDetailedByIds(permissionGroupIds);
      if (requestedGroups.length !== permissionGroupIds.length) {
        throw new NotFoundException('One or more permission groups not found');
      }
      const connection = await this.connectionManager.getConnection(tenant);
      await this.syncTenantPermissions(connection.sql, requestedGroups);
    }
    return updatedEntity;
  }
  private async syncTenantPermissions(connection: DataSource, permissionGroups: AdminPermissionGroupEntity[]) {
    const permGroupRepo = connection.getRepository(PermissionGroupEntity);
    const permRepo = connection.getRepository(PermissionEntity);
    const roleRepo = connection.getRepository(RoleEntity);

    const seededPermissions: PermissionEntity[] = [];

    // 1. Upsert incoming groups and permissions
    for (const group of permissionGroups) {
      let tenantGroup = await permGroupRepo.findOne({ where: { slug: group.slug } });

      if (!tenantGroup) {
        tenantGroup = await permGroupRepo.save(
          permGroupRepo.create({
            name: group.name,
            slug: group.slug,
            href: group.href,
            description: group.description,
          }),
        );
      }

      for (const permission of group.permissions ?? []) {
        let tenantPerm = await permRepo.findOne({ where: { key: permission.key } });

        if (!tenantPerm) {
          tenantPerm = await permRepo.save(
            permRepo.create({
              key: permission.key,
              name: permission.name,
              description: permission.description,
              groupId: tenantGroup.id,
            }),
          );
        }

        seededPermissions.push(tenantPerm);
      }
    }

    // 2. Remove permissions that are no longer in any assigned group
    const incomingKeys = seededPermissions.map((p) => p.key);
    const allTenantPerms = await permRepo.find();
    const toRemove = allTenantPerms.filter((p) => !incomingKeys.includes(p.key));

    if (toRemove.length) {
      await permRepo.remove(toRemove);
    }

    // 3. Remove permission groups that are no longer assigned
    const incomingSlugs = permissionGroups.map((g) => g.slug);
    const allTenantGroups = await permGroupRepo.find();
    const groupsToRemove = allTenantGroups.filter(
      (g) => g.slug !== 'dashboard' && !incomingSlugs.includes(g.slug), // 👈 never remove dashboard
    );

    if (groupsToRemove.length) {
      await permGroupRepo.remove(groupsToRemove);
    }

    // 4. Update Admin role permissions to reflect the new set
    const adminRole = await roleRepo.findOne({
      where: { name: 'Admin' },
      relations: { permissions: true },
    });

    if (adminRole) {
      adminRole.permissions = seededPermissions;
      await roleRepo.save(adminRole);
    }

    // 5. Update Staff role to only have read permissions from new set
    const staffRole = await roleRepo.findOne({
      where: { name: 'Staff' },
      relations: { permissions: true },
    });

    if (staffRole) {
      staffRole.permissions = seededPermissions.filter((p) => p.key.endsWith('.read'));
      await roleRepo.save(staffRole);
    }

    console.log(`✅ Tenant permissions synced`);
  }
  async deleteTenant(id: string) {
    const tenant = await this.tenantRepository.getByTenantId(id);
    entityNotFound(tenant, 'Tenant');
    await this.connectionManager.closeConnection(id);
    if (tenant?.dbName && tenant?.dbUser) {
      await this.deprovisionMongoDatabase(tenant.dbName);
      await this.deprovisionDatabase(tenant.dbName, tenant.dbUser);
    }
    await this.tenantRepository.delete(id);
    return { message: 'Tenant and associated databases deleted successfully' };
  }
}
