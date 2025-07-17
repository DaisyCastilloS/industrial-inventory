import { AuditLog, IAuditLog } from '../entity/AuditLog';
import { AuditAction } from '../../../shared/constants/RoleTypes';
import { ServiceResult } from '../../../infrastructure/services/base/ServiceTypes';
import type { TableName, IpAddress } from '../entity/AuditLog';

export interface IAuditLogRepository {
  create(auditLog: IAuditLog): Promise<ServiceResult<AuditLog>>;
  findById(id: number): Promise<ServiceResult<AuditLog | null>>;
  findAll(): Promise<ServiceResult<AuditLog[]>>;
  findByTable(tableName: TableName | string): Promise<ServiceResult<AuditLog[]>>;
  findByRecord(tableName: TableName | string, recordId: number): Promise<ServiceResult<AuditLog[]>>;
  findByAction(action: AuditAction): Promise<ServiceResult<AuditLog[]>>;
  findByUser(userId: number): Promise<ServiceResult<AuditLog[]>>;
  findByIpAddress(ipAddress: IpAddress | string): Promise<ServiceResult<AuditLog[]>>;
  findRecent(limit?: number): Promise<ServiceResult<AuditLog[]>>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ServiceResult<AuditLog[]>>;
  findByTableAndAction(tableName: TableName | string, action: AuditAction): Promise<ServiceResult<AuditLog[]>>;
  getStats(): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueUsers: number;
    uniqueTables: number;
  }>>;
  getTableStats(tableName: TableName | string): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueUsers: number;
  }>>;
  getUserStats(userId: number): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueTables: number;
  }>>;
  cleanOldLogs(daysToKeep: number): Promise<ServiceResult<number>>;
}
