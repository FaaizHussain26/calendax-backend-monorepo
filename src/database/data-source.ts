// src/database/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config(); // 👈 manually loads .env since NestJS isn't running

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
      }
    : {
        type: 'postgres',
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT!, 10) || 5432,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
      },
);
