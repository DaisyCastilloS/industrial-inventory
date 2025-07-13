/**
 * @fileoverview Implementación del repositorio de logs de auditoría
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { AuditLog, IAuditLog } from "../../01-domain/entity/AuditLog";
import { IAuditLogRepository } from "../../01-domain/repository/AuditLogRepository";

/**
 * Consultas SQL para logs de auditoría
 */
const AuditLogQueries = {
  create: `
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, ip_address, user_agent, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `,
  
  findById: `
    SELECT * FROM audit_logs WHERE id = $1
  `,
  
  findByTableName: `
    SELECT * FROM audit_logs WHERE table_name = $1 ORDER BY created_at DESC
  `,
  
  findByRecordId: `
    SELECT * FROM audit_logs WHERE table_name = $1 AND record_id = $2 ORDER BY created_at DESC
  `,
  
  findByUserId: `
    SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC
  `,
  
  findByAction: `
    SELECT * FROM audit_logs WHERE action = $1 ORDER BY created_at DESC
  `,
  
  findAll: `
    SELECT * FROM audit_logs ORDER BY created_at DESC
  `,
  
  findByDateRange: `
    SELECT * FROM audit_logs 
    WHERE created_at BETWEEN $1 AND $2 
    ORDER BY created_at DESC
  `,
  
  getRecentLogs: `
    SELECT * FROM audit_logs 
    ORDER BY created_at DESC 
    LIMIT $1
  `,
  
  getAuditStats: `
    SELECT 
      table_name,
      action,
      COUNT(*) as count
    FROM audit_logs 
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY table_name, action
    ORDER BY count DESC
  `,
  
  deleteOldLogs: `
    DELETE FROM audit_logs 
    WHERE created_at < $1
  `
};

/**
 * Implementación del repositorio de logs de auditoría
 */
export class AuditLogRepositoryImpl implements IAuditLogRepository {
  
  async create(auditLog: IAuditLog): Promise<AuditLog> {
    const result = await pool.query(AuditLogQueries.create, [
      auditLog.tableName,
      auditLog.recordId,
      auditLog.action,
      auditLog.oldValues ? JSON.stringify(auditLog.oldValues) : null,
      auditLog.newValues ? JSON.stringify(auditLog.newValues) : null,
      auditLog.userId,
      auditLog.ipAddress,
      auditLog.userAgent,
      auditLog.createdAt || new Date()
    ]);
    
    if (result.rows.length > 0) {
      const createdAuditLog = new AuditLog({
        id: result.rows[0].id,
        tableName: auditLog.tableName,
        recordId: auditLog.recordId,
        action: auditLog.action,
        oldValues: auditLog.oldValues,
        newValues: auditLog.newValues,
        userId: auditLog.userId,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        createdAt: auditLog.createdAt || new Date()
      });
      return createdAuditLog;
    }
    
    throw new Error('Error al crear log de auditoría');
  }

  async findById(id: number): Promise<AuditLog | null> {
    const result = await pool.query(AuditLogQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    });
  }

  async findByTableName(tableName: string): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByTableName, [tableName]);
    return result.rows.map(row => new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    }));
  }

  async findByRecordId(tableName: string, recordId: number): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByRecordId, [tableName, recordId]);
    return result.rows.map(row => new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    }));
  }

  async findByUserId(userId: number): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByUserId, [userId]);
    return result.rows.map(row => new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    }));
  }

  async findByAction(action: string): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByAction, [action]);
    return result.rows.map(row => new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    }));
  }

  async findAll(): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findAll);
    return result.rows.map(row => new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    }));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByDateRange, [startDate, endDate]);
    return result.rows.map(row => new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    }));
  }

  async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.getRecentLogs, [limit]);
    return result.rows.map(row => new AuditLog({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    }));
  }

  async getAuditStats(startDate: Date, endDate: Date): Promise<any[]> {
    const result = await pool.query(AuditLogQueries.getAuditStats, [startDate, endDate]);
    return result.rows;
  }

  async deleteOldLogs(beforeDate: Date): Promise<number> {
    const result = await pool.query(AuditLogQueries.deleteOldLogs, [beforeDate]);
    return result.rowCount || 0;
  }
} 