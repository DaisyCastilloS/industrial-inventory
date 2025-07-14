/**
 * @fileoverview Interfaz del repositorio de logs de auditoría
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { AuditLog, IAuditLog } from '../entity/AuditLog';
import { AuditAction } from '../../00-constants/RoleTypes';
// Tipos semánticos importados de la entidad AuditLog
import type { TableName, IpAddress } from '../entity/AuditLog';

/**
 * Interfaz del repositorio de logs de auditoría
 *
 * Todos los métodos usan tipado semántico y permiten parametrización de tipos.
 */
export interface IAuditLogRepository<T = unknown> {
  /**
   * Crea un nuevo log de auditoría
   * @param auditLog - Datos del log
   * @returns Log de auditoría creado
   */
  create(auditLog: IAuditLog<T>): Promise<AuditLog<T>>;

  /**
   * Busca un log por ID
   * @param id - ID del log
   * @returns Log encontrado o null
   */
  findById(id: number): Promise<AuditLog<T> | null>;

  /**
   * Obtiene todos los logs
   * @returns Lista de logs
   */
  findAll(): Promise<AuditLog<T>[]>;

  /**
   * Busca logs por tabla (tipado semántico)
   * @param tableName - Nombre de la tabla
   * @returns Lista de logs de la tabla
   */
  findByTable(tableName: TableName | string): Promise<AuditLog<T>[]>;

  /**
   * Busca logs por registro
   * @param tableName - Nombre de la tabla
   * @param recordId - ID del registro
   * @returns Lista de logs del registro
   */
  findByRecord(tableName: TableName | string, recordId: number): Promise<AuditLog<T>[]>;

  /**
   * Busca logs por acción
   * @param action - Acción de auditoría
   * @returns Lista de logs de la acción
   */
  findByAction(action: AuditAction): Promise<AuditLog<T>[]>;

  /**
   * Busca logs por usuario
   * @param userId - ID del usuario
   * @returns Lista de logs del usuario
   */
  findByUser(userId: number): Promise<AuditLog<T>[]>;

  /**
   * Busca logs por IP (tipado semántico)
   * @param ipAddress - Dirección IP
   * @returns Lista de logs de la IP
   */
  findByIpAddress(ipAddress: IpAddress | string): Promise<AuditLog<T>[]>;

  /**
   * Obtiene logs recientes
   * @param limit - Límite de logs a obtener
   * @returns Lista de logs recientes
   */
  findRecent(limit?: number): Promise<AuditLog<T>[]>;

  /**
   * Busca logs en un rango de fechas
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @returns Lista de logs en el rango
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog<T>[]>;

  /**
   * Busca logs por tabla y acción (tipado semántico)
   * @param tableName - Nombre de la tabla
   * @param action - Acción de auditoría
   * @returns Lista de logs que coinciden
   */
  findByTableAndAction(tableName: TableName | string, action: AuditAction): Promise<AuditLog<T>[]>;

  /**
   * Obtiene estadísticas de auditoría
   * @returns Estadísticas de auditoría
   */
  getStats(): Promise<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueUsers: number;
    uniqueTables: number;
  }>;

  /**
   * Obtiene estadísticas de auditoría por tabla (tipado semántico)
   * @param tableName - Nombre de la tabla
   * @returns Estadísticas de auditoría de la tabla
   */
  getTableStats(tableName: TableName | string): Promise<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueUsers: number;
  }>;

  /**
   * Obtiene estadísticas de auditoría por usuario
   * @param userId - ID del usuario
   * @returns Estadísticas de auditoría del usuario
   */
  getUserStats(userId: number): Promise<{
    totalLogs: number;
    createLogs: number;
    updateLogs: number;
    deleteLogs: number;
    uniqueTables: number;
  }>;

  /**
   * Limpia logs antiguos
   * @param daysToKeep - Días a mantener
   * @returns Número de logs eliminados
   */
  cleanOldLogs(daysToKeep: number): Promise<number>;
} 