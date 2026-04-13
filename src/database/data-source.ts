// src/database/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
dotenv.config(); // 👈 manually loads .env since NestJS isn't running
const baseConfig = {
  entities: [__dirname + '/../modules/!(tenant-modules)/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  namingStrategy: new SnakeNamingStrategy(), // 👈 must match app.module config
  synchronize: false,
}
export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        ...baseConfig,
      }
    : {
        type: 'postgres',
        host: process.env.PGHOST,
        port: parseInt(process.env.PGHOST!, 10) || 5432,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ...baseConfig,
      },
);