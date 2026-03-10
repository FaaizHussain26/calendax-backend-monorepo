import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './utils/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { JWTService } from './utils/commonservices/jwt.service';
import { OtpModule } from './otp/otp.module';
import { PatientModule } from './patient/patient.module';
import { SiteModule } from './site/site.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './roles/role.module';
import { PermissionGroupModule } from './permission-group/permission-group.module';
import { PatientSiteModule } from './patient-site/patient-site.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppMailerModule } from './utils/mailers/email.module';
import { LeadsModule } from './leads/lead.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    UserModule,
    AuthenticationModule,
    OtpModule,
    PatientModule,
    SiteModule,
    PermissionModule,
    RoleModule,
    PermissionGroupModule,
    PatientSiteModule,
    AppMailerModule,
    LeadsModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
      uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    TypeOrmModule.forRootAsync({
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
  ],
  providers: [JwtService,JWTService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
