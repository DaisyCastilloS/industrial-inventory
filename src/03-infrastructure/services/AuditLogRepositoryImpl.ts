/**
 * @fileoverview Implementación del repositorio de logs de auditoría
 * @author Daisy Castillo
 * @version 1.0.2
 */

import { pool } from "../db/database";
import { AuditLog, IAuditLog } from "../../01-domain/entity/AuditLog";
import { AuditAction } from "../../00-constants/RoleTypes";
import type { TableName, IpAddress } from "../../01-domain/entity/AuditLog";
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
  /**
   * Crea un nuevo log de auditoría en la base de datos.
   */
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
      return this.#mapRowToAuditLog({
        ...auditLog,
        id: result.rows[0].id,
        created_at: auditLog.createdAt || new Date()
      });
    }
    throw new Error('Error al crear log de auditoría');
  }

  /**
   * Busca un log de auditoría por su ID.
   */
  async findById(id: number): Promise<AuditLog | null> {
    const result = await pool.query(AuditLogQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    return this.#mapRowToAuditLog(result.rows[0]);
  }

  /**
   * Obtiene todos los logs de auditoría.
   */
  async findAll(): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findAll);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Busca logs de auditoría por nombre de tabla.
   */
  async findByTable(tableName: TableName | string): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByTableName, [tableName]);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Busca logs de auditoría por registro específico de una tabla.
   */
  async findByRecord(tableName: TableName | string, recordId: number): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByRecordId, [tableName, recordId]);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Busca logs de auditoría por acción.
   */
  async findByAction(action: AuditAction): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByAction, [action]);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Busca logs de auditoría por usuario.
   */
  async findByUser(userId: number): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByUserId, [userId]);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Busca logs de auditoría por dirección IP.
   */
  async findByIpAddress(ipAddress: IpAddress | string): Promise<AuditLog[]> {
    // No hay consulta directa, se implementa como ejemplo
    const result = await pool.query('SELECT * FROM audit_logs WHERE ip_address = $1 ORDER BY created_at DESC', [ipAddress]);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Obtiene logs recientes.
   */
  async findRecent(limit: number = 100): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.getRecentLogs, [limit]);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Busca logs de auditoría en un rango de fechas.
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    const result = await pool.query(AuditLogQueries.findByDateRange, [startDate, endDate]);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Busca logs por tabla y acción.
   */
  async findByTableAndAction(tableName: TableName | string, action: AuditAction): Promise<AuditLog[]> {
    const result = await pool.query('SELECT * FROM audit_logs WHERE table_name = $1 AND action = $2 ORDER BY created_at DESC', [tableName, action]);
    return result.rows.map(this.#mapRowToAuditLog);
  }

  /**
   * Obtiene estadísticas globales de auditoría.
   */
  async getStats(): Promise<{ totalLogs: number; createLogs: number; updateLogs: number; deleteLogs: number; uniqueUsers: number; uniqueTables: number; }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_logs,
        SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as create_logs,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as update_logs,
        SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as delete_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT table_name) as unique_tables
      FROM audit_logs
    `);
    const row = result.rows[0];
    return {
      totalLogs: Number(row.total_logs),
      createLogs: Number(row.create_logs),
      updateLogs: Number(row.update_logs),
      deleteLogs: Number(row.delete_logs),
      uniqueUsers: Number(row.unique_users),
      uniqueTables: Number(row.unique_tables)
    };
  }

  /**
   * Obtiene estadísticas de auditoría por tabla.
   */
  async getTableStats(tableName: TableName | string): Promise<{ totalLogs: number; createLogs: number; updateLogs: number; deleteLogs: number; uniqueUsers: number; }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_logs,
        SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as create_logs,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as update_logs,
        SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as delete_logs,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit_logs
      WHERE table_name = $1
    `, [tableName]);
    const row = result.rows[0];
    return {
      totalLogs: Number(row.total_logs),
      createLogs: Number(row.create_logs),
      updateLogs: Number(row.update_logs),
      deleteLogs: Number(row.delete_logs),
      uniqueUsers: Number(row.unique_users)
    };
  }

  /**
   * Obtiene estadísticas de auditoría por usuario.
   */
  async getUserStats(userId: number): Promise<{ totalLogs: number; createLogs: number; updateLogs: number; deleteLogs: number; uniqueTables: number; }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_logs,
        SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as create_logs,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as update_logs,
        SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as delete_logs,
        COUNT(DISTINCT table_name) as unique_tables
      FROM audit_logs
      WHERE user_id = $1
    `, [userId]);
    const row = result.rows[0];
    return {
      totalLogs: Number(row.total_logs),
      createLogs: Number(row.create_logs),
      updateLogs: Number(row.update_logs),
      deleteLogs: Number(row.delete_logs),
      uniqueTables: Number(row.unique_tables)
    };
  }

  /**
   * Limpia logs antiguos.
   */
  async cleanOldLogs(daysToKeep: number): Promise<number> {
    const result = await pool.query(
      'DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL $1 DAY',
      [daysToKeep]
    );
    return result.rowCount || 0;
  }

  /**
   * Mapea una fila de la base de datos a la entidad AuditLog.
   */
  #mapRowToAuditLog(row: any): AuditLog {
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
} 