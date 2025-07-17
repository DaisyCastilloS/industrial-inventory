import { AuditLog, IAuditLog } from '../../core/domain/entity/AuditLog';
import { IAuditLogRepository } from '../../core/domain/repository/AuditLogRepository';
import { AuditAction } from '../../shared/constants/RoleTypes';
import type { TableName, IpAddress } from '../../core/domain/entity/AuditLog';
import { AuditLogQueries } from '../db/sqlQueries/AuditLogQueries';
import { pool } from '../db/database';
import { ServiceResult } from './base/ServiceTypes';

interface SearchCriteria {
  tableName?: string;
  userId?: number;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
}

interface TableStats {
  tableName: string;
  count: number;
}

interface ActionStats {
  action: string;
  count: number;
}

interface SecurityStats {
  uniqueIps: number;
  uniqueUsers: number;
  totalActions: number;
  firstAction: Date;
  lastAction: Date;
}

export class AuditLogRepositoryImpl implements IAuditLogRepository {
  protected tableName = 'audit_logs';

  private mapRowToAuditLog(row: any): AuditLog {
    return new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action || AuditAction.CREATE, // Default to CREATE if not specified
      oldValues: row.old_values,
      newValues: row.new_values,
      userId: row.user_id && row.user_id > 0 ? row.user_id : undefined, // Handle null/0 userId
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      reviewed: row.reviewed,
      metadata: row.metadata,
    });
  }

  async create(auditLog: IAuditLog): Promise<ServiceResult<AuditLog>> {
    const result = await pool.query(AuditLogQueries.insert, [
      auditLog.tableName,
      auditLog.recordId,
      auditLog.action,
      auditLog.oldValues,
      auditLog.newValues,
      auditLog.userId,
      auditLog.ipAddress,
      auditLog.userAgent,
    ]);
    return { success: true, data: this.mapRowToAuditLog(result.rows[0]) };
  }

  async findById(id: number): Promise<ServiceResult<AuditLog | null>> {
    const result = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return { success: true, data: result.rows[0] ? this.mapRowToAuditLog(result.rows[0]) : null };
  }

  async findAll(): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async findByTable(tableName: TableName | string): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(`SELECT * FROM ${this.tableName} WHERE table_name = $1`, [tableName]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async findByRecord(tableName: TableName | string, recordId: number): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(`SELECT * FROM ${this.tableName} WHERE table_name = $1 AND record_id = $2`, [tableName, recordId]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async findByAction(action: AuditAction): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(`SELECT * FROM ${this.tableName} WHERE action = $1`, [action]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async findByUser(userId: number): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(`SELECT * FROM ${this.tableName} WHERE user_id = $1`, [userId]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async findByIpAddress(ipAddress: IpAddress | string): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(`SELECT * FROM ${this.tableName} WHERE ip_address = $1`, [ipAddress]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async findRecent(limit: number = 100): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1`, [limit]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async findByTableAndAction(tableName: TableName | string, action: AuditAction): Promise<ServiceResult<AuditLog[]>> {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE table_name = $1 AND action = $2`,
      [tableName, action]
    );
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async searchByMultipleCriteria(criteria: SearchCriteria): Promise<ServiceResult<AuditLog[]>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (criteria.tableName) {
      conditions.push(`table_name = $${paramCount++}`);
      params.push(criteria.tableName);
    }
    if (criteria.userId) {
      conditions.push(`user_id = $${paramCount++}`);
      params.push(criteria.userId);
    }
    if (criteria.action) {
      conditions.push(`action = $${paramCount++}`);
      params.push(criteria.action);
    }
    if (criteria.startDate) {
      conditions.push(`created_at >= $${paramCount++}`);
      params.push(criteria.startDate);
    }
    if (criteria.endDate) {
      conditions.push(`created_at <= $${paramCount++}`);
      params.push(criteria.endDate);
    }
    if (criteria.ipAddress) {
      conditions.push(`ip_address = $${paramCount++}`);
      params.push(criteria.ipAddress);
    }

    const query = `SELECT * FROM ${this.tableName} ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''} ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async searchByTextInValues(searchText: string): Promise<ServiceResult<AuditLog[]>> {
    const query = `SELECT * FROM ${this.tableName} WHERE (old_values::text ILIKE $1 OR new_values::text ILIKE $1) ORDER BY created_at DESC`;
    const result = await pool.query(query, [`%${searchText}%`]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async getStatsByTable(): Promise<ServiceResult<TableStats[]>> {
    const query = `SELECT table_name, COUNT(*) as count FROM ${this.tableName} GROUP BY table_name ORDER BY count DESC`;
    const result = await pool.query(query);
    return {
      success: true,
      data: result.rows.map(row => ({
        tableName: row.table_name,
        count: parseInt(row.count)
      }))
    };
  }

  async getStatsByAction(): Promise<ServiceResult<ActionStats[]>> {
    const query = `SELECT action, COUNT(*) as count FROM ${this.tableName} GROUP BY action ORDER BY count DESC`;
    const result = await pool.query(query);
    return {
      success: true,
      data: result.rows.map(row => ({
        action: row.action,
        count: parseInt(row.count)
      }))
    };
  }

  async getSecurityStats(startDate: Date, endDate: Date): Promise<ServiceResult<SecurityStats>> {
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
        lastAction: new Date(row.last_action)
      }
    };
  }

  async getRecordHistory(tableName: string, recordId: number): Promise<ServiceResult<AuditLog[]>> {
    const query = `SELECT * FROM ${this.tableName} WHERE table_name = $1 AND record_id = $2 ORDER BY created_at ASC`;
    const result = await pool.query(query, [tableName, recordId]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async getUserRecentActivity(userId: number, limit: number = 50): Promise<ServiceResult<AuditLog[]>> {
    const query = `SELECT * FROM ${this.tableName} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`;
    const result = await pool.query(query, [userId, limit]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async getActivityByIp(ipAddress: string, limit: number = 50): Promise<ServiceResult<AuditLog[]>> {
    const query = `SELECT * FROM ${this.tableName} WHERE ip_address = $1 ORDER BY created_at DESC LIMIT $2`;
    const result = await pool.query(query, [ipAddress, limit]);
    return { success: true, data: result.rows.map(row => this.mapRowToAuditLog(row)) };
  }

  async getStats(): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueUsers: number;
    uniqueTables: number;
  }>> {
    const [totalResult, actionResult, userResult, tableResult] = await Promise.all([
      pool.query(AuditLogQueries.stats.total),
      pool.query(AuditLogQueries.stats.byAction),
      pool.query(AuditLogQueries.stats.byUser),
      pool.query(AuditLogQueries.stats.byTable)
    ]);

    const actionCounts = actionResult.rows.reduce((acc: any, row) => {
      acc[row.action] = parseInt(row.count);
      return acc;
    }, {});

    const stats = {
      totalLogs: parseInt(totalResult.rows[0].count),
      createLogs: actionCounts['CREATE'] || 0,
      updateLogs: actionCounts['UPDATE'] || 0,
      deleteLogs: actionCounts['DELETE'] || 0,
      uniqueUsers: userResult.rows.length,
      uniqueTables: tableResult.rows.length
    };

    return { success: true, data: stats };
  }

  async getTableStats(tableName: TableName | string): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueUsers: number;
  }>> {
    const [totalResult, actionResult, userResult] = await Promise.all([
      pool.query(AuditLogQueries.findByTable, [tableName]),
      pool.query(AuditLogQueries.findByTableAndAction, [tableName, 'CREATE']),
      pool.query(`SELECT COUNT(DISTINCT user_id) as count FROM audit_logs WHERE table_name = $1`, [tableName])
    ]);

    const stats = {
      totalLogs: totalResult.rows.length,
      createLogs: actionResult.rows.length,
      updateLogs: totalResult.rows.filter(row => row.action === 'UPDATE').length,
      deleteLogs: totalResult.rows.filter(row => row.action === 'DELETE').length,
      uniqueUsers: parseInt(userResult.rows[0].count)
    };

    return { success: true, data: stats };
  }

  async getUserStats(userId: number): Promise<ServiceResult<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueTables: number;
  }>> {
    const [totalResult, tableResult] = await Promise.all([
      pool.query(AuditLogQueries.findByUser, [userId]),
      pool.query(`SELECT COUNT(DISTINCT table_name) as count FROM audit_logs WHERE user_id = $1`, [userId])
    ]);

    const stats = {
      totalLogs: totalResult.rows.length,
      createLogs: totalResult.rows.filter(row => row.action === 'CREATE').length,
      updateLogs: totalResult.rows.filter(row => row.action === 'UPDATE').length,
      deleteLogs: totalResult.rows.filter(row => row.action === 'DELETE').length,
      uniqueTables: parseInt(tableResult.rows[0].count)
    };

    return { success: true, data: stats };
  }

  async cleanOldLogs(daysToKeep: number): Promise<ServiceResult<number>> {
    const query = `DELETE FROM ${this.tableName} WHERE created_at < NOW() - INTERVAL '${daysToKeep} days' RETURNING id`;
    const result = await pool.query(query);
    return { success: true, data: result.rowCount || 0 };
  }
}
