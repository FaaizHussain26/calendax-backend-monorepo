import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUES } from '../queue.config';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateTenantDto } from '../../../modules/tenant/tenant.dto';
import { Job } from 'bullmq';
import { TenantJobData } from '../../../common/interfaces/tenant.inteface';
import { TenantService } from '../../../modules/tenant/tenant.service';
import { TenantConnectionManager } from '../../../database/tenant/tenant-connection.manager';
import { TenantRepository } from '../../../modules/tenant/tenant.repository';
import { TenantEntity } from '../../../modules/tenant/tenant.entity';
import { TenantStatus, TenantUserRoles } from '../../../common/enums/tenant.enum';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminPermissionGroupEntity } from '../../../modules/permission-group/permission-group.entity';
import { PermissionGroupEntity } from '../../../modules/tenant-modules/rbac/permission-group/permission-group.entity';
import { PermissionEntity } from '../../../modules/tenant-modules/rbac/permission/permission.entity';
import { RoleEntity } from '../../../modules/tenant-modules/rbac/role/role.entity';
import { UserEntity } from '../../../modules/tenant-modules/user/user.entity';
import { MongoAdminService } from '../../../database/master/mongo-admin.service';
import { InjectDataSource } from '@nestjs/typeorm';

@Processor(QUEUES.TENANT, {
  concurrency: 1,
})
export class TenantProcessor extends WorkerHost {
  private readonly logger = new Logger(TenantProcessor.name);

  constructor(
    @InjectDataSource('master')
    private masterDataSource: DataSource,
    private readonly mongoAdmin: MongoAdminService,
    private readonly configService: ConfigService,
    private readonly tenantRepository: TenantRepository,
    private connectionManager: TenantConnectionManager,
    private readonly tenantService: TenantService,
  ) {
    super();
  }

  async process(job: Job<TenantJobData>): Promise<void> {
    const { tenantId, dto,permissionGroup, dbName, slug, dbPassword } = job.data;
    let tenant: TenantEntity | null = null;

    tenant = await this.tenantRepository.getByTenantId(tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
    this.logger.log(`Processing Tenant: ${tenantId} attempt: ${job.attemptsMade + 1}`);

    await job.updateProgress(10);
    await this.provisionDatabase(dbName, slug, dbPassword);
    await job.updateProgress(30);
    const mongoUri = await this.provisionMongoDatabase(dbName);
    await this.tenantRepository.updateTenant(tenantId, { mongoUri });
    const updatedTenantData = await this.tenantRepository.getByTenantId(tenantId);
    await job.updateProgress(50);
    const connection = await this.connectionManager.getConnection(updatedTenantData!);
    await job.updateProgress(60);
    await connection.sql.runMigrations();
    await job.updateProgress(80);
    await this.seedTenantDatabase(connection.sql, dto, permissionGroup);
    await job.updateProgress(90);
    await this.tenantRepository.updateTenant(tenantId, {
      status: TenantStatus.ACTIVE,
    });
    await job.updateProgress(100);
    this.logger.log(`Tenant ${tenantId} provisioned successfully`);
  }
  @OnWorkerEvent('failed')
  async onFailed(job: Job<TenantJobData>, error: Error): Promise<void> {
    this.logger.error(
      `Job ${job.id} failed for tenant ${job.data.tenantId} attempt ${job.attemptsMade}: ${error.message}`,
    );
    // only rollback after ALL retries are exhausted
    if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
      this.logger.warn(`All retries exhausted for tenant ${job.data.tenantId}. Rolling back...`);

      try {
        const { tenantId, dbName, slug } = job.data;

        const tenant = await this.tenantRepository.getByTenantId(tenantId);
        await this.handleProvisioningFailure(tenant, dbName, slug, error);
      } catch (rollbackError) {
        this.logger.error(`Rollback also failed for tenant ${job.data.tenantId}: ${rollbackError}`);
      }
    } else {
      this.logger.log(`Retrying tenant ${job.data.tenantId}... (${job.attemptsMade}/${job.opts.attempts ?? 3})`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} completed`);
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
  public async provisionMongoDatabase(dbName: string) {
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
      const err = error instanceof Error ? error : new Error(String(error));

      throw new Error(`Mongo Provisioning Failed: ${err?.message}`);
    }
  }

  public async handleProvisioningFailure(tenant: TenantEntity | null, dbName: string, dbUser: string, error: unknown) {
    console.log('Provisioning failed, rolling back...', error);

    try {
      if (tenant?.id) {
        await this.tenantRepository.updateTenant(tenant.id, {
          status: TenantStatus.FAILED,
        });
        await this.connectionManager.closeConnection(tenant.id);
      }

      await this.tenantService.deprovisionDatabase(dbName, dbUser);
      await this.tenantService.deprovisionMongoDatabase(dbName);
    } catch (rollbackError) {
      // Log rollback failure but don't throw — original error takes priority
      console.log('Rollback also failed:', rollbackError);
    }
  }
}
