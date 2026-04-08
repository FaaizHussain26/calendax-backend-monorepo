// src/database/master/wipe.script.ts
import { AppDataSource } from '../data-source';

const MASTER_TABLES = [
  'admin_permissions',
  'admins',
  'pages',
  'permission_groups',
  'permissions',
  'tenants',
  'tenant_permission_groups',
];

async function wipe() {
  await AppDataSource.initialize();

  const tableNames = MASTER_TABLES.map((t) => `"${t}"`).join(', ');
  await AppDataSource.query(
    `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`,
  );

  console.log('✅ Master DB wiped successfully');
  await AppDataSource.destroy();
}

wipe().catch((err) => {
  console.error('❌ Wipe failed:', err);
  process.exit(1);
});