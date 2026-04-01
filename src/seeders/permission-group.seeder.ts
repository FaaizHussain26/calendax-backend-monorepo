// src/database/master/seeders/permission-group.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminPermissionGroupEntity } from '../modules/permission-group/permission-group.entity';
import { AdminPermissionEntity } from '../modules/permission/permission.entity';

interface PermissionGroupSeed {
  name: string;
  slug: string;
  href: string;
  description: string;
  permissions: {
    key: string;
    name: string;
    description: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroupSeed[] = [
  {
    name: 'Dashboard',
    slug: 'dashboard',
    href: '/dashboard',
    description: 'Permissions related to dashboard',
    permissions: [
      {
        key: 'dashboard.read',
        name: 'View Dashboard',
        description: 'Ability to view dashboard',
      },
    ],
  },
  {
    name: 'User Management',
    slug: 'users',
    href: '/dashboard/users',
    description: 'Permissions related to managing users',
    permissions: [
      {
        key: 'users.read',
        name: 'View Users',
        description: 'Ability to view users',
      },
      {
        key: 'users.create',
        name: 'Create Users',
        description: 'Ability to add new users',
      },
      {
        key: 'users.update',
        name: 'Update Users',
        description: 'Ability to update user information',
      },
      {
        key: 'users.delete',
        name: 'Delete Users',
        description: 'Ability to delete users',
      },
    ],
  },
  {
    name: 'Role Management',
    slug: 'roles',
    href: '/dashboard/roles',
    description: 'Permissions related to managing roles',
    permissions: [
      {
        key: 'roles.read',
        name: 'View Roles',
        description: 'Ability to view roles',
      },
      {
        key: 'roles.create',
        name: 'Create Roles',
        description: 'Ability to add new roles',
      },
      {
        key: 'roles.update',
        name: 'Update Roles',
        description: 'Ability to update roles',
      },
      {
        key: 'roles.delete',
        name: 'Delete Roles',
        description: 'Ability to delete roles',
      },
    ],
  },
  {
    name: 'Permission Management',
    slug: 'permissions',
    href: '/dashboard/permissions',
    description: 'Permissions related to managing permissions',
    permissions: [
      {
        key: 'permissions.read',
        name: 'View Permissions',
        description: 'Ability to view permissions',
      },
      {
        key: 'permissions.create',
        name: 'Create Permissions',
        description: 'Ability to add new permissions',
      },
      {
        key: 'permissions.update',
        name: 'Update Permissions',
        description: 'Ability to update permissions',
      },
      {
        key: 'permissions.delete',
        name: 'Delete Permissions',
        description: 'Ability to delete permissions',
      },
    ],
  },
  {
    name: 'Permission Group Management',
    slug: 'permission_groups',
    href: '/dashboard/permission-groups',
    description: 'Permissions related to managing permission groups',
    permissions: [
      {
        key: 'permission_groups.read',
        name: 'View Permission Groups',
        description: 'Ability to view permission groups',
      },
      {
        key: 'permission_groups.create',
        name: 'Create Permission Groups',
        description: 'Ability to add new permission groups',
      },
      {
        key: 'permission_groups.update',
        name: 'Update Permission Groups',
        description: 'Ability to update permission groups',
      },
      {
        key: 'permission_groups.delete',
        name: 'Delete Permission Groups',
        description: 'Ability to delete permission groups',
      },
    ],
  },
  {
    name: 'Tenant Management',
    slug: 'tenants',
    href: '/dashboard/tenants',
    description: 'Permissions related to managing tenants',
    permissions: [
      {
        key: 'tenants.read',
        name: 'View Tenants',
        description: 'Ability to view tenants',
      },
      {
        key: 'tenants.create',
        name: 'Create Tenants',
        description: 'Ability to create new tenants',
      },
      {
        key: 'tenants.update',
        name: 'Update Tenants',
        description: 'Ability to update tenants',
      },
      {
        key: 'tenants.delete',
        name: 'Delete Tenants',
        description: 'Ability to delete tenants',
      },
    ],
  },
  {
    name: 'Appointment Management',
    slug: 'appointments',
    href: '/dashboard/appointments',
    description: 'Permissions related to managing appointments',
    permissions: [
      {
        key: 'appointments.read',
        name: 'View Appointments',
        description: 'Ability to view appointments',
      },
      {
        key: 'appointments.create',
        name: 'Create Appointments',
        description: 'Ability to add new appointments',
      },
      {
        key: 'appointments.update',
        name: 'Update Appointments',
        description: 'Ability to update appointments',
      },
      {
        key: 'appointments.delete',
        name: 'Delete Appointments',
        description: 'Ability to delete appointments',
      },
    ],
  },
  {
    name: 'Site Management',
    slug: 'sites',
    href: '/dashboard/sites',
    description: 'Permissions related to managing sites',
    permissions: [
      {
        key: 'sites.read',
        name: 'View Sites',
        description: 'Ability to view sites',
      },
      {
        key: 'sites.create',
        name: 'Create Sites',
        description: 'Ability to add new sites',
      },
      {
        key: 'sites.update',
        name: 'Update Sites',
        description: 'Ability to update sites',
      },
      {
        key: 'sites.delete',
        name: 'Delete Sites',
        description: 'Ability to delete sites',
      },
    ],
  },
  {
    name: 'Patient Management',
    slug: 'patients',
    href: '/dashboard/patients',
    description: 'Permissions related to managing patients',
    permissions: [
      {
        key: 'patients.read',
        name: 'View Patients',
        description: 'Ability to view patients',
      },
      {
        key: 'patients.create',
        name: 'Create Patients',
        description: 'Ability to add new patients',
      },
      {
        key: 'patients.update',
        name: 'Update Patients',
        description: 'Ability to update patients',
      },
      {
        key: 'patients.delete',
        name: 'Delete Patients',
        description: 'Ability to delete patients',
      },
    ],
  },
  {
    name: 'Lead Management',
    slug: 'leads',
    href: '/dashboard/leads',
    description: 'Permissions related to managing leads',
    permissions: [
      {
        key: 'leads.read',
        name: 'View Leads',
        description: 'Ability to view leads',
      },
      {
        key: 'leads.create',
        name: 'Create Leads',
        description: 'Ability to add new leads',
      },
      {
        key: 'leads.update',
        name: 'Update Leads',
        description: 'Ability to update leads',
      },
      {
        key: 'leads.delete',
        name: 'Delete Leads',
        description: 'Ability to delete leads',
      },
    ],
  },
  {
    name: 'Notification Management',
    slug: 'notifications',
    href: '/dashboard/notifications',
    description: 'Permissions related to managing notifications',
    permissions: [
      {
        key: 'notifications.read',
        name: 'View Notifications',
        description: 'Ability to view notifications',
      },
      {
        key: 'notifications.create',
        name: 'Create Notifications',
        description: 'Ability to create notifications',
      },
      {
        key: 'notifications.update',
        name: 'Update Notifications',
        description: 'Ability to update notifications',
      },
      {
        key: 'notifications.delete',
        name: 'Delete Notifications',
        description: 'Ability to delete notifications',
      },
    ],
  },
  {
    name: 'Report Management',
    slug: 'reports',
    href: '/dashboard/reports',
    description: 'Permissions related to managing reports',
    permissions: [
      {
        key: 'reports.read',
        name: 'View Reports',
        description: 'Ability to view reports',
      },
      {
        key: 'reports.create',
        name: 'Create Reports',
        description: 'Ability to create reports',
      },
      {
        key: 'reports.update',
        name: 'Update Reports',
        description: 'Ability to update reports',
      },
      {
        key: 'reports.delete',
        name: 'Delete Reports',
        description: 'Ability to delete reports',
      },
    ],
  },
  {
    name: 'Settings',
    slug: 'settings',
    href: '/dashboard/settings',
    description: 'Permissions related to managing settings',
    permissions: [
      {
        key: 'settings.read',
        name: 'View Settings',
        description: 'Ability to view settings',
      },
      {
        key: 'settings.update',
        name: 'Update Settings',
        description: 'Ability to update settings',
      },
    ],
  },
];

@Injectable()
export class PermissionGroupSeeder {
  constructor(
    @InjectRepository(AdminPermissionGroupEntity, 'master')
    private readonly groupRepo: Repository<AdminPermissionGroupEntity>,

    @InjectRepository(AdminPermissionEntity, 'master')
    private readonly permissionRepo: Repository<AdminPermissionEntity>,
  ) {}

  async seed() {
    console.log('🌱 Seeding permission groups and permissions...');

    for (const groupData of PERMISSION_GROUPS) {
      // ✅ skip if already exists — idempotent seeder
      const existing = await this.groupRepo.findOne({
        where: { slug: groupData.slug },
      });
      if (existing) {
        console.log(`⏭️  Skipping existing group: ${groupData.name}`);
        continue;
      }

      // create group
      const group = await this.groupRepo.save(
        this.groupRepo.create({
          name: groupData.name,
          slug: groupData.slug,
          href: groupData.href,
          description: groupData.description,
        }),
      );

      // create permissions for this group
      for (const perm of groupData.permissions) {
        const existingPerm = await this.permissionRepo.findOne({
          where: { key: perm.key },
        });
        if (existingPerm) continue;

        await this.permissionRepo.save(
          this.permissionRepo.create({
            key: perm.key,
            name: perm.name,
            description: perm.description,
            groupId: group.id,
          }),
        );
      }

      console.log(`✅ Seeded group: ${groupData.name}`);
    }

    console.log('✅ Permission groups and permissions seeded');
  }
}