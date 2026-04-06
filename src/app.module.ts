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
import { JwtCommonModule } from './common/jwt/jwt.module';
import { SeederModule } from './database/master/seeder.module';
import { TenantModulesModule } from './modules/tenant-modules/tenant-modules.module';
import { AdminPermissionGroupModule } from './modules/permission-group/permission-group.module';
import { AdminPermissionModule } from './modules/permission/permission.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuditModule } from './database/audit-logs/audit.module';
import { MongoAdminModule } from './database/master/mongo-admin.module';
import { TenantContextMiddleware } from './middlewares/tenant-context.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      name: 'master',
      inject: [ConfigService],
useFactory: (config: ConfigService) => {
    const url = config.get<string>('DATABASE_URL');
    if (url) {
      return {
        type: 'postgres',
        url,
        autoLoadEntities: true,
        synchronize: false, 
        ssl: { rejectUnauthorized: false },
      };
    }

    // Development — use individual credentials
    return {
      type: 'postgres',
      host: config.get<string>('PGHOST'),
      port: config.get<number>('PGPORT'),
      username: config.get<string>('PGUSER'),
      password: config.get<string>('PGPASSWORD'),
      database: config.get<string>('PGDATABASE'),
      autoLoadEntities: true,
      synchronize: true,
    };
  },
    }),
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
    consumer.apply(DecryptPayloadMiddleware).forRoutes('patients', 'tenant');
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes('auth', 'users', 'permission-groups', 'permissions', 'roles', 'patients');
  }
}
