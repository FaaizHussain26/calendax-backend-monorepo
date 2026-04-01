// src/database/master/seeders/root.seeder.ts
import { Injectable } from '@nestjs/common';
import { PermissionGroupSeeder } from './permission-group.seeder';
import { AdminSeeder } from './admin.seeder';

@Injectable()
export class RootSeeder {
  constructor(
    private readonly adminSeeder: AdminSeeder,
    private readonly permissionGroupSeeder: PermissionGroupSeeder,
  ) {}

  async seed() {
    console.log('🌱 Starting master DB seeding...');
    await this.permissionGroupSeeder.seed();
    await this.adminSeeder.seed();
    console.log('✅ Master DB seeding complete');
  }
}