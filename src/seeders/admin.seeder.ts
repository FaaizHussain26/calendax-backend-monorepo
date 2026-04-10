// src/database/master/seeders/admin.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminEntity } from '../modules/admin/entities/admin.entity';
import { AdminRoles } from '../common/enums/admin.enum';

@Injectable()
export class AdminSeeder {
  constructor(
    @InjectRepository(AdminEntity, 'master')
    private readonly adminRepo: Repository<AdminEntity>,
  ) {}

  async seed() {
    console.log('🌱 Seeding super admin...');

    const email = 'superadmin@calendax.com';
    const existing = await this.adminRepo.findOne({ where: { email } });

    if (existing) {
      console.log('⏭️  Super admin already exists, skipping');
      return;
    }

    await this.adminRepo.save(
      this.adminRepo.create({
        name: 'Super Admin',
        email,
        password: await bcrypt.hash('ChangeMe123!', 10),
        role: AdminRoles.SUPER_ADMIN,
        isActive: true,
      }),
    );

    console.log('✅ Super admin seeded');
  }
}
