/**
 * @fileoverview Enums para roles de usuario del sistema
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Roles de usuario disponibles en el sistema
 * @enum {string}
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

/**
 * Tipos de movimiento de inventario
 * @enum {string}
 */
export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

/**
 * Acciones de auditoría
 * @enum {string}
 */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Estados de stock
 * @enum {string}
 */
export enum StockStatus {
  NORMAL = 'NORMAL',
  CRITICAL = 'CRÍTICO',
  OUT_OF_STOCK = 'SIN STOCK',
}

/**
 * Niveles de severidad para errores
 * @enum {string}
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
