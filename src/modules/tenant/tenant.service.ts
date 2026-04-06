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
import { TenantConnectionManager } from '../../common/database/tenant/tenant-connection.manager';
import { ConfigService } from '@nestjs/config';
import { HelperFunctions } from '../../common/utils/functions';
import { TenantStatus, TenantUserRoles } from '../../enums/tenant.enum';
import { TenantEntity } from './tenant.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdminPermissionGroupRepository } from '../permission-group/permission-group.repository';
import { AdminPermissionGroupEntity } from '../permission-group/permission-group.entity';
import { PermissionGroupEntity } from '../tenant-modules/rbac/permission-group/permission-group.entity';
import { PermissionEntity } from '../tenant-modules/rbac/permission/permission.entity';
import { RoleEntity } from '../tenant-modules/rbac/role/role.entity';
import { UserEntity } from '../tenant-modules/user/user.entity';
import * as bcrypt from 'bcrypt';
import { MongoAdminService } from '../../common/database/master/mongo-admin.service';
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
  ) {}

  async getAllTenants(query: findTenantDto) {
    return await this.tenantRepository.getAllTenants(query);
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantRepository.getByTenantId(id);
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

    const dashboardGroup = await this.adminPermissionGroupRepository.findDetailedByCondition({
      slug: 'dashboard',
    });
    if (!dashboardGroup) {
      throw new NotFoundException('Dashboard permission group not found. Run seeders first.');
    }
    let requestedGroups: AdminPermissionGroupEntity[] = [];
    if (dto.permissionGroupIds?.length) {
      requestedGroups = await this.adminPermissionGroupRepository.findDetailedByIds(dto.permissionGroupIds);
      if (requestedGroups.length !== dto.permissionGroupIds.length) {
        throw new NotFoundException('One or more permission groups not found');
      }
    }

    // ✅ merge dashboard + requested groups, deduplicate
    const allGroups = [dashboardGroup, ...requestedGroups.filter((g) => g.slug !== 'dashboard')];
    console.log('all groups:::', allGroups);
    try {
      await this.provisionDatabase(dbName, slug, dbPassword);
      const mongoUri = await this.provisionMongoDatabase(dbName);
      tenant = await this.tenantRepository.createTenant({
        ...dto,
        slug,
        dbHost: this.configService.get<string>('tenant.db.host'),
        dbPort: this.configService.get<number>('tenant.db.port') ?? 5432,
        dbUser: slug,
        dbPassword,
        dbName,
        mongoUri,
        status: TenantStatus.PROVISIONING,
        permissionGroups: allGroups,
      });
      const connection = await this.connectionManager.getConnection(tenant);
      await connection.sql.runMigrations();
      await this.seedTenantDatabase(connection.sql, dto, allGroups);
      await this.tenantRepository.updateTenant(tenant.id, {
        status: TenantStatus.ACTIVE,
      });
      return tenant;
    } catch (error) {
      // 5. Rollback everything if anything fails
      await this.handleProvisioningFailure(tenant, dbName, slug, error);
      throw new InternalServerErrorException('Tenant provisioning failed. Changes have been rolled back.');
    }
  }
  private async seedTenantDatabase(
    connection: DataSource,
    dto: CreateTenantDto,
    permissionGroups: AdminPermissionGroupEntity[],
  ) {
    const permGroupRepo = connection.getRepository(PermissionGroupEntity);
    const permRepo = connection.getRepository(PermissionEntity);
    const roleRepo = connection.getRepository(RoleEntity);
    const userRepo = connection.getRepository(UserEntity);

    // 1. seed permission groups + permissions into tenant DB
    const seededPermissions: PermissionEntity[] = [];

    for (const group of permissionGroups) {
      // upsert group
      let tenantGroup = await permGroupRepo.findOne({
        where: { slug: group.slug },
      });

      if (!tenantGroup) {
        tenantGroup = await permGroupRepo.save(
          permGroupRepo.create({
            name: group.name,
            slug: group.slug,
            href: group.href,
            description: group.description,
          }),
        );
        console.log('tenant group created:', group.name);
      }
      const groupPerms = group.permissions ?? [];
      console.log('group perms are', group);
      // upsert permissions
      for (const permission of groupPerms) {
        let tenantPerm = await permRepo.findOne({
          where: { key: permission.key },
        });

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

    // 2. create Admin role with ALL seeded permissions
    const adminRole = await roleRepo.save(
      roleRepo.create({
        name: 'Admin',
        isDefault: false,
        permissions: seededPermissions,
      }),
    );

    // 3. create Staff role with read-only permissions
    const readPermissions = seededPermissions.filter((p) => p.key.endsWith('.read'));
    await roleRepo.save(
      roleRepo.create({
        name: 'Staff',
        isDefault: true, // ✅ auto assigned to new users
        permissions: readPermissions,
      }),
    );

    // 4. create tenant admin user
    const rawPassword = dto.adminPassword ?? this.configService.get<string>('defaultPassword');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await userRepo.save(
      userRepo.create({
        firstName: dto.adminFirstName ?? 'Tenant',
        lastName: dto.adminLastName ?? 'Admin',
        email: dto.adminEmail,
        password: hashedPassword,
        userType: TenantUserRoles.TENANT_ADMIN,
        roleId: adminRole.id,
        isActive: true,
      }),
    );

    // 5. send welcome email with credentials
    // await this.emailService.sendWelcome({
    //   toEmail: dto.adminEmail,
    //   subject: 'Your tenant account has been created',
    //   data: {
    //     name: `${dto.adminFirstName ?? 'Tenant'} ${dto.adminLastName ?? 'Admin'}`,
    //     email: dto.adminEmail,
    //     tempPassword: rawPassword,
    //   },
    // });

    console.log(`✅ Tenant DB seeded for: ${dto.adminEmail}`);
  }
  private async handleProvisioningFailure(tenant: TenantEntity | null, dbName: string, dbUser: string, error: unknown) {
    console.error('Provisioning failed, rolling back...', error);

    try {
      if (tenant?.id) {
        await this.tenantRepository.updateTenant(tenant.id, {
          status: TenantStatus.FAILED,
        });
        await this.connectionManager.closeConnection(tenant.id);
      }

      await this.deprovisionDatabase(dbName, dbUser);
      await this.deprovisionMongoDatabase(dbName);
    } catch (rollbackError) {
      // Log rollback failure but don't throw — original error takes priority
      console.error('Rollback also failed:', rollbackError);
    }
  }
  private async deprovisionMongoDatabase(dbName: string) {
    try {
      // Simply drop the database using the master client
      await this.mongoAdmin.clientInstance.db(dbName).dropDatabase();
      console.log(`Successfully dropped Mongo DB: ${dbName}`);
    } catch (e) {
      console.warn(`Mongo cleanup warning: ${e.message}`);
    }
  }
  private async provisionDatabase(dbName: string, dbUser: string, dbPassword: string) {
    const masterConn = this.masterDataSource;
    await masterConn.query(`CREATE DATABASE "${dbName}"`);
    await masterConn.query(`CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}'`);
    await masterConn.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}"`);

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
    await tenantAdminConn.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${dbUser}"`);
    await tenantAdminConn.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${dbUser}"`);
    await tenantAdminConn.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${dbUser}"`);
    await tenantAdminConn.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${dbUser}"`);
    await tenantAdminConn.destroy();
  }
  private async provisionMongoDatabase(dbName: string) {
    try {
      // 1. Get the "Admin" client instance (the one using your master string)
      const client = this.mongoAdmin.clientInstance;

      // 2. Access the new tenant-specific database
      const tenantDb = client.db(dbName);

      // 3. Force the database into existence by creating a collection
      await tenantDb.createCollection('_init');

      // 4. Construct the tenant-specific URI using your master credentials
      // We just swap the database name at the end of the string
      const user = this.configService.get<string>('db.mongodb.user');
      const pass = this.configService.get<string>('db.mongodb.password');
      const host = this.configService.get<string>('db.mongodb.host'); // cluster0.5o5gbw1.mongodb.net

      // Note: No authSource=dbName here because we are using the Master User
      return `mongodb+srv://${user}:${pass}@${host}/${dbName}?retryWrites=true&w=majority`;
    } catch (error) {
      throw new Error(`Mongo Provisioning Failed: ${error.message}`);
    }
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
