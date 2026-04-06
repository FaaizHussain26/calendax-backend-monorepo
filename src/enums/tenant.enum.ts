export enum TenantUserRoles {
  TENANT_ADMIN = 'TENANT_ADMIN',
  TENANT_STAFF = 'TENANT_STAFF',
  PATIENT = 'PATIENT',
}
// enums/tenant-status.enum.ts
export enum TenantStatus {
  // Tenant has been created but not yet fully provisioned
  PROVISIONING = 'provisioning',

  // DB created, migrations run, ready to use
  ACTIVE = 'active',

  // Admin manually suspended the tenant
  SUSPENDED = 'suspended',

  // Payment failed / trial ended
  INACTIVE = 'inactive',

  // Tenant requested deletion — data retained for grace period
  PENDING_DELETION = 'pending_deletion',

  // DB dropped, data purged
  DELETED = 'deleted',

  // Something went wrong during provisioning
  FAILED = 'failed',
}
