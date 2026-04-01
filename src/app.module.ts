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
import { SeederModule } from './common/database/master/seeder.module';
import { TenantModulesModule } from './modules/tenant-modules/tenant-modules.module';
import { AdminPermissionGroupModule } from './modules/permission-group/permission-group.module';
import { AdminPermissionModule } from './modules/permission/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      name: 'master',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    JwtCommonModule,
    AdminModule,
    PageModule,
    AdminPermissionGroupModule,
    AdminPermissionModule,
    TenantModule,
    TenantModulesModule,
    SeederModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
   configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DecryptPayloadMiddleware)
      .forRoutes('patients'); // only patient routes
  }
}
