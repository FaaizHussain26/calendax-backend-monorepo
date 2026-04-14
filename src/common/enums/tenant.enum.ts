
export enum TenantUserRoles {
  TENANT_ADMIN = 'tenant_admin',
  TENANT_STAFF = 'tenant_staff',
  PATIENT = 'patient',
  PRINCIPLE_INVESTIGATOR = 'principle_investigator',
}
// enums/tenant-status.enum.ts
export enum TenantStatus {
  PROVISIONING = 'provisioning',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
  PENDING_DELETION = 'pending_deletion',
  DELETED = 'deleted',
  FAILED = 'failed',
}
