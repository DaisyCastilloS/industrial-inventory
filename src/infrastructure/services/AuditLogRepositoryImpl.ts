/**
 * @fileoverview Implementación del repositorio de logs de auditoría
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { AuditLog, IAuditLog } from '../../core/domain/entity/AuditLog';
import { IAuditLogRepository } from '../../core/domain/repository/AuditLogRepository';
import { AuditAction } from '../../shared/constants/RoleTypes';
import type { TableName, IpAddress } from '../../core/domain/entity/AuditLog';
import { AuditLogQueries } from '../db/sqlQueries/AuditLogQueries';
import { pool } from '../db/database';
import { ServiceResult } from './base/ServiceTypes';

export class AuditLogRepositoryImpl implements IAuditLogRepository {
  protected tableName = 'audit_logs';

  private mapRowToAuditLog(row: any): AuditLog {
    return new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values,
      newValues: row.new_values,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      reviewed: row.reviewed,
      metadata: row.metadata,
    });
  }

  async create(entity: IAuditLog): Promise<ServiceResult<AuditLog>> {
    const fields = Object.keys(entity).filter(
      key => (entity as any)[key] !== undefined
    );
    const values = fields.map(field => (entity as any)[field]);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')}, created_at, updated_at)
      VALUES (${placeholders.join(', ')}, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      return { success: true, data: new AuditLog(result.rows[0]) };
    }
    return {
      success: false,
      error: new Error(`Error al crear ${this.tableName}`),
    };
  }

  async findById(id: number): Promise<ServiceResult<AuditLog | null>> {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return {
      success: true,
      data: result.rows.length > 0 ? new AuditLog(result.rows[0]) : null,
    };
  }

  async findAll(): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`
    );
    return {
      success: true,
      data: result.rows.map(row => new AuditLog(row)),
    };
  }

  async findByTable(tableName: TableName | string): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.findByTable, [tableName]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async findByRecord(
    tableName: TableName | string,
    recordId: number
  ): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.findByRecord, [
      tableName,
      recordId,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async findByAction(action: AuditAction): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.findByAction, [action]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async findByUser(userId: number): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.findByUser, [userId]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async findByIpAddress(ipAddress: IpAddress | string): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.findByIpAddress, [
      ipAddress,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async findRecent(limit: number = 100): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.findRecent, [limit]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.findByDateRange, [
      startDate,
      endDate,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async findByTableAndAction(
    tableName: TableName | string,
    action: AuditAction
  ): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.findByTableAndAction, [
      tableName,
      action,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async getStats(): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueUsers: number;
    uniqueTables: number;
  }>> {
    const result = await pool.query(AuditLogQueries.stats.byDateRange, [
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
      new Date(),
    ]);
    const row = result.rows[0];
    return {
      success: true,
      data: {
        totalLogs: Number(row.total_logs),
        createLogs: Number(row.create_logs || 0),
        updateLogs: Number(row.update_logs || 0),
        deleteLogs: Number(row.delete_logs || 0),
        uniqueUsers: Number(row.unique_users),
        uniqueTables: Number(row.unique_tables),
      },
    };
  }

  async getTableStats(tableName: TableName | string): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueUsers: number;
  }>> {
    const result = await pool.query(AuditLogQueries.stats.byTable, [tableName]);
    const row = result.rows[0];
    return {
      success: true,
      data: {
        totalLogs: Number(row.total_logs),
        createLogs: Number(row.create_logs || 0),
        updateLogs: Number(row.update_logs || 0),
        deleteLogs: Number(row.delete_logs || 0),
        uniqueUsers: Number(row.unique_users),
      },
    };
  }

  async getUserStats(userId: number): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueTables: number;
  }>> {
    const result = await pool.query(AuditLogQueries.stats.byUserAndAction, [
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(),
    ]);

    const userStats = result.rows.filter(row => row.user_id === userId);
    const totalLogs = userStats.reduce(
      (sum, row) => sum + parseInt(row.count),
      0
    );
    const createLogs = userStats
      .filter(row => row.action === 'CREATE')
      .reduce((sum, row) => sum + parseInt(row.count), 0);
    const updateLogs = userStats
      .filter(row => row.action === 'UPDATE')
      .reduce((sum, row) => sum + parseInt(row.count), 0);
    const deleteLogs = userStats
      .filter(row => row.action === 'DELETE')
      .reduce((sum, row) => sum + parseInt(row.count), 0);

    return {
      success: true,
      data: {
        totalLogs,
        createLogs,
        updateLogs,
        deleteLogs,
        uniqueTables: 0, // Se puede implementar si es necesario
      },
    };
  }

  async cleanOldLogs(daysToKeep: number): Promise<ServiceResult<number>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await pool.query(AuditLogQueries.maintenance.deleteOldLogs, [
      cutoffDate,
    ]);
    return {
      success: true,
      data: result.rowCount || 0,
    };
  }

  async searchByMultipleCriteria(criteria: {
    tableName?: string;
    userId?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.search.byMultipleCriteria, [
      criteria.tableName,
      criteria.userId,
      criteria.action,
      criteria.startDate,
      criteria.endDate,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async searchByTextInValues(searchText: string): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.search.byTextInValues, [
      `%${searchText}%`,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async getStatsByTable(): Promise<ServiceResult<{ tableName: string; count: number }[]>> {
    const query = `
      SELECT table_name, COUNT(*) as count
      FROM ${this.tableName}
      GROUP BY table_name
      ORDER BY count DESC
    `;
    const result = await pool.query(query);
    return {
      success: true,
      data: result.rows.map(row => ({
        tableName: row.table_name,
        count: parseInt(row.count),
      })),
    };
  }

  async getStatsByAction(): Promise<ServiceResult<{ action: string; count: number }[]>> {
    const query = `
      SELECT action, COUNT(*) as count
      FROM ${this.tableName}
      GROUP BY action
      ORDER BY count DESC
    `;
    const result = await pool.query(query);
    return {
      success: true,
      data: result.rows.map(row => ({
        action: row.action,
        count: parseInt(row.count),
      })),
    };
  }

  async getSecurityStats(startDate: Date, endDate: Date): Promise<ServiceResult<{
    uniqueIps: number;
    uniqueUsers: number;
    totalActions: number;
    firstAction: Date;
    lastAction: Date;
  }>> {
    const query = `
      SELECT
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_actions,
        MIN(created_at) as first_action,
        MAX(created_at) as last_action
      FROM ${this.tableName}
      WHERE created_at BETWEEN $1 AND $2
    `;
    const result = await pool.query(query, [startDate, endDate]);
    const row = result.rows[0];
    return {
      success: true,
      data: {
        uniqueIps: parseInt(row.unique_ips),
        uniqueUsers: parseInt(row.unique_users),
        totalActions: parseInt(row.total_actions),
        firstAction: new Date(row.first_action),
        lastAction: new Date(row.last_action),
      },
    };
  }

  async getRecordHistory(tableName: string, recordId: number): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.audit.getRecordHistory, [
      tableName,
      recordId,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async getUserRecentActivity(userId: number, limit: number = 10): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.audit.getUserRecentActivity, [
      userId,
      limit,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }

  async getActivityByIp(ipAddress: string): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(AuditLogQueries.audit.getActivityByIp, [
      ipAddress,
    ]);
    return {
      success: true,
      data: result.rows.map(row => this.mapRowToAuditLog(row)),
    };
  }
}
