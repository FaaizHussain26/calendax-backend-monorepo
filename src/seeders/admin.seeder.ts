// src/database/master/seeders/admin.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminEntity } from '../modules/admin/entities/admin.entity';
import { AdminRoles } from '@libs/common//enums/admin.enum';
import { PageEntity } from '../modules/page/page.entity';

interface PagesSeed {
  name: string;
  icon: string;
  slug: string;
  href: string;
}

const PAGES: PagesSeed[] = [
  {
    name: 'Dashboard',
    icon: 'lucide:layout-dashboard',
    slug: 'dashboard',
    href: '/dashboard',
  },
  {
    name: 'Sub Admin',
    icon: 'lucide:users',
    slug: 'sub-admin',
    href: '/sub-admin',
  },
  {
    name: 'Permission Groups',
    icon: 'lucide:shield-check',
    slug: 'permission-groups',
    href: '/permission-groups',
  },
  {
    name: 'Permissions',
    icon: 'lucide:lock',
    slug: 'permissions',
    href: '/permissions',
  },
  {
    name: 'Pages',
    icon: 'lucide:file-text',
    slug: 'pages',
    href: '/pages',
  },
  {
    name: 'Tenant',
    icon: 'lucide:users',
    slug: 'tenant',
    href: '/tenants',
  },
];
@Injectable()
export class AdminSeeder {
  constructor(
    @InjectRepository(AdminEntity, 'master')
    private readonly adminRepo: Repository<AdminEntity>,

    @InjectRepository(PageEntity, 'master')
    private readonly pageRepo: Repository<PageEntity>,
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

    const totalpages = await this.pageRepo.count();
    if (totalpages > 0 && totalpages != null) {
      return;
    }

    for (const pageData of PAGES) {
      // create pages
      const page = await this.pageRepo.save(
        this.pageRepo.create({
          name: pageData.name,
          icon: pageData.icon,
          slug: pageData.slug,
          href: pageData.href,
        }),
      );
    }
  }
}
