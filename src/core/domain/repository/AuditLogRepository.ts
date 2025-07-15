/**
 * @fileoverview Interfaz del repositorio de logs de auditoría
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { AuditLog, IAuditLog } from '../entity/AuditLog';
import { AuditAction } from '../../../shared/constants/RoleTypes';
import { ServiceResult } from '../../../infrastructure/services/base/ServiceTypes';
import type { TableName, IpAddress } from '../entity/AuditLog';

/**
 * Interfaz del repositorio de logs de auditoría
 */
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
  searchByMultipleCriteria(criteria: {
    tableName?: string;
    userId?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ServiceResult<AuditLog[]>>;
  searchByTextInValues(searchText: string): Promise<ServiceResult<AuditLog[]>>;
  getStatsByTable(): Promise<ServiceResult<{ tableName: string; count: number }[]>>;
  getStatsByAction(): Promise<ServiceResult<{ action: string; count: number }[]>>;
  getSecurityStats(startDate: Date, endDate: Date): Promise<ServiceResult<{
    uniqueIps: number;
    uniqueUsers: number;
    totalActions: number;
    firstAction: Date;
    lastAction: Date;
  }>>;
  getRecordHistory(tableName: string, recordId: number): Promise<ServiceResult<AuditLog[]>>;
  getUserRecentActivity(userId: number, limit?: number): Promise<ServiceResult<AuditLog[]>>;
  getActivityByIp(ipAddress: string): Promise<ServiceResult<AuditLog[]>>;
}
