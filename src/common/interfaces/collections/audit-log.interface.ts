export const ADMIN_SYSTEM_LOGS_DB_NAME='system_admin_logs'
export const ADMIN_LOGS_DOCUMENT_COLLECTION='audit_logs'

export interface IAuditLog {
  action: string;
  actorId: string;
  actorEmail: string;
  actorType: 'SUPER_ADMIN' | 'TENANT_USER';
  targetId?: string;
  payload: unknown;
  ipAddress: string;
  createdAt: Date;
}