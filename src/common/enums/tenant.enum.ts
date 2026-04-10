export enum TenantUserRoles {
  TENANT_ADMIN = 'TENANT_ADMIN',
  TENANT_STAFF = 'TENANT_STAFF',
  PATIENT = 'PATIENT',
  PRINCIPLE_INVESTIGATOR = 'PRINCIPLE_INVESTIGATOR',
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
