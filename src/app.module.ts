import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { PageModule } from './modules/page/page.module';
import configuration from './config/configuration';
import { TenantModule } from './modules/tenant/tenant.module';
import { DecryptPayloadMiddleware } from './middlewares/decrypt-payload.middleware';
import { JwtCommonModule } from './services/jwt/jwt.module';
import { SeederModule } from './database/master/seeder.module';
import { TenantModulesModule } from './modules/tenant-modules/tenant-modules.module';
import { AdminPermissionGroupModule } from './modules/permission-group/permission-group.module';
import { AdminPermissionModule } from './modules/permission/permission.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuditModule } from './database/audit-logs/audit.module';
import { MongoAdminModule } from './database/master/mongo-admin.module';
import { TenantContextMiddleware } from './middlewares/tenant-context.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from './services/redis/redis.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 20,
      },
    ]),
    TypeOrmModule.forRootAsync({
      name: 'master',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('db.postgres.url');
        if (url) {
          return {
            type: 'postgres',
            namingStrategy: new SnakeNamingStrategy(),
            url,
            autoLoadEntities: true,
            synchronize: config.get<string>('environment') === 'production' ? false : true,
            ssl: { rejectUnauthorized: false },
          };
        }

        // Development — use individual credentials
        return {
          type: 'postgres',
          namingStrategy: new SnakeNamingStrategy(),
          host: config.get<string>('db.postgres.host'),
          port: config.get<number>('db.postgres.port'),
          username: config.get<string>('db.postgres.user'),
          password: config.get<string>('db.postgres.password'),
          database: config.get<string>('db.postgres.db'),
          autoLoadEntities: true,
          synchronize: true,logging: true,
        };
      },
    }),
    RedisModule,
    AuditModule,
    MongoAdminModule,
    JwtCommonModule,
    AdminModule,
    PageModule,
    AdminPermissionGroupModule,
    AdminPermissionModule,
    TenantModule,
    TenantModulesModule,
    SeederModule,
    FileUploadModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(DecryptPayloadMiddleware).forRoutes('patients', 'tenant');
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes('auth', 'users', 'permission-groups', 'permissions', 'roles', 'patients', 'sites', 'indication','protocols');
  }
}
